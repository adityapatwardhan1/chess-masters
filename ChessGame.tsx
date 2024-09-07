import React, { Component } from "react";
import {
    View,
    Dimensions,
    StyleSheet,
    Text,
    TouchableHighlight,
    Image,
    Alert,
} from "react-native";

import { Chessboard } from "chessboard-rn";
import { Chess, SQUARES } from "chess.js";
import { Timer } from "./Timer.tsx";

// Height of device window
let deviceHeight = Dimensions.get("window").height;

// Stockfish API URL
const STOCKFISH_API_URI = "https://stockfish.online/api/s/v2.php";

// Pieces
let pieces = [
    { name: "b", uri: require("./images/pieces/bb.png") },
    { name: "n", uri: require("./images/pieces/bn.png") },
    { name: "q", uri: require("./images/pieces/bq.png") },
    { name: "br", uri: require("./images/pieces/br.png") },
];

// Colors
let silver = "#b8b8b8";
let cyan = "#b5e6e6";

// Class for Chess game component
export class ChessGame extends Component {
    state = {
        fen: "start",
        pieceSquare: "", // Current position of selected piece
        square: "", // Square selected to move the piece to
        history: [], // Game history
        checkMessageDisplay: "none", 
        endgameMessageDisplay: "none",
        endgameMessage: "",
        gameboardDisplay: "block",
        game: new Chess(), // Game and timers
        timerWhite: new Timer(),
        timerBlack: new Timer(),
        gameStarted: false, 
        curPlayer: "white",
        recommendedMoveWhite: null, // Move recommended by Stockfish
        recommendedMoveBlack: null,
    };

    constructor(props) {
        super(props);
    }

    // Prepare the game board and rules
    componentWillMount() {
        // Castling rights
        this.state.game.setCastlingRights(Chess.WHITE, {
            [Chess.KING]: true,
            [Chess.QUEEN]: true,
        });
        this.state.game.setCastlingRights(Chess.BLACK, {
            [Chess.KING]: true,
            [Chess.QUEEN]: true,
        });
        
        // Initialize game state
        this.setState({
            history: this.state.game.history({ verbose: true }),
            curPlayer: "white",
        });

        // Initialize timer
        this.state.timerWhite.setTime(Number(this.props.gameLength));
        this.state.timerWhite.setIncr(Number(this.props.timerIncr));
        this.state.timerBlack.setTime(Number(this.props.gameLength));
        this.state.timerBlack.setIncr(Number(this.props.timerIncr));
    }

    // Reset the game state
    resetAll = () => {
        this.setState({
            gameStarted: false,
            fen: "start",
            pieceSquare: "",
            square: "",
            history: [],
            checkMessageDisplay: "none",
            endgameMessageDisplay: "none",
            gameboardDisplay: "block",
            curPlayer: "white",
            game: new Chess(),
            recommendedMoveAnalyzeMode: null,
        });

        // Pause timer
        this.state.timerWhite.pause();
        this.state.timerBlack.pause();
        return;
    };

    // Handles logic when player presses a square on the game board.
    onSquarePress = async (square) => {
        try {
            let boardOrientation = this.props.boardOrientation;
            
            // Initialize game
            if (!this.state.gameStarted) {
                this.state.timerWhite.reset();
                this.state.timerWhite.setTime(Number(this.props.gameLength));
                this.state.timerWhite.setIncr(Number(this.props.timerIncr));
                this.state.timerBlack.reset();
                this.state.timerBlack.setTime(Number(this.props.gameLength));
                this.state.timerBlack.setIncr(Number(this.props.timerIncr));
                this.state.timerWhite.start(() => {
                    this.setState({});
                });
                this.setState({ gameStarted: true });
                
                // Analysis mode: Start the game with custom position if valid.
                if (this.props.mode == "Analysis Mode") {
                    try {
                        this.state.fen = this.props.startFen;
                        this.state.game = new Chess(this.props.startFen);
                    } catch {
                        Alert.alert("Invalid FEN, please fix");
                    }
                }
            }

            // Reset game when it is over
            if (
                this.state.game.isGameOver() ||
                ((this.state.timerWhite.state.time == 0 ||
                    this.state.timerBlack.state.time == 0) &&
                    this.props.mode != "Analysis Mode" &&
                    Number(this.props.gameLength) > 0)
            ) {
                await this.setState({
                    gameStarted: false,
                    fen: "start",
                    pieceSquare: "",
                    square: "",
                    history: [],
                    checkMessageDisplay: "none",
                    endgameMessageDisplay: "none",
                    gameboardDisplay: "block",
                    boardOrientation: "white",
                    game: new Chess(),
                    recommendedMoveWhite: null,
                    recommendedMoveBlack: null,
                });
                this.state.timerWhite.pause();
                this.state.timerBlack.pause();
                return;
            }
            
            
            if (this.state.pieceSquare != "") {
                let squareIndex = SQUARES.indexOf(this.state.pieceSquare);
                let boardLength = 8; // 8x8 board
                
                // Handle promotions
                if (
                    (this.state.game.board()[parseInt(squareIndex / boardLength)][
                        squareIndex % boardLength
                    ].type == "p" &&
                        this.state.game.board()[parseInt(squareIndex / boardLength)][
                            squareIndex % boardLength
                        ].color == "w" &&
                        square[1] == ""+boardLength) ||
                    (this.state.game.board()[parseInt(squareIndex / boardLength)][
                        squareIndex % boardLength
                    ].type == "p" &&
                        this.state.game.board()[parseInt(squareIndex / boardLength)][
                            squareIndex % boardLength
                        ].color == "b" &&
                        square[1] == "1")
                ) {
                    let move = this.state.game.move({
                        from: this.state.pieceSquare,
                        to: square,
                        promotion: "q",
                    });
                    // Invalid promotion
                    if (move === null) {
                        return;
                    }
                } else {
                    // No promotion
                    let move = this.state.game.move({
                        from: this.state.pieceSquare,
                        to: square,
                    });
                    if (move === null) {
                        return;
                    }
                }
                
                // Check for check or endgame
                let inCheck = this.state.game.inCheck();
                let isCheckmate = this.state.game.isCheckmate();
                let isOver = this.state.game.isGameOver();

                // Endgame logic
                if (isCheckmate) {
                    this.setState({
                        endgameMessage: "CHECKMATE!",
                    });
                } else if (isOver) {
                    this.setState({
                        endgameMessage: "DRAW",
                    });
                }

                let curPlayer = this.state.curPlayer;
                
                // Update game state after making move
                await this.setState({
                    gameStarted: true,
                    fen: this.state.game.fen(),
                    history: this.state.game.history({ verbose: true }),
                    pieceSquare: "",
                    curPlayer:
                        this.state.curPlayer == "white" ? "black" : "white",
                    checkMessageDisplay: inCheck && !isOver ? "block" : "none",
                    endgameMessageDisplay: isOver ? "block" : "none",
                });

                // Analysis mode: Update recommended move based on new board
                if (this.props.mode == "Analysis Mode") {
                    let theRecommendedMoveWhite = await this.getStockfishAPI(
                        this.getFenBasedOnCurrentPlayerSide(
                            this.state.fen,
                            "b",
                        ),
                    );
                    let theRecommendedMoveBlack = await this.getStockfishAPI(
                        this.getFenBasedOnCurrentPlayerSide(
                            this.state.fen,
                            "w",
                        ),
                    );
                    await this.setState({
                        recommendedMoveWhite: theRecommendedMoveWhite,
                        recommendedMoveBlack: theRecommendedMoveBlack,
                    });
                }

                // Reset timer if over
                if (
                    isOver ||
                    this.state.timerWhite.state.time == 0 ||
                    this.state.timerBlack.state.time == 0
                ) {
                    this.state.timerWhite.reset();
                    this.state.timerBlack.reset();
                    this.setState({
                        gameStarted: false,
                    });
                } else if (curPlayer == "white") {
                    this.state.timerWhite.increment();
                    this.state.timerWhite.pause();
                    this.state.timerBlack.start(() => {
                        this.setState({});
                    });
                    if (this.props.mode == "Play vs Computer") {
                        let [firstSquare, secondSquare] =
                            await this.getStockfishAPI(this.state.fen);
                        await this.onSquarePress(firstSquare);
                        await this.onSquarePress(secondSquare);
                    }
                } else {
                    this.state.timerBlack.increment();
                    this.state.timerBlack.pause();
                    this.state.timerWhite.start(() => {
                        this.setState({});
                    });
                }
            } else {
                await this.setState({
                    fen: this.state.game.fen(),
                    history: this.state.game.history({ verbose: true }),
                    pieceSquare: square,
                });
            }
        } catch {
            // If the move being made is invalid
            this.setState({
                fen: this.state.game.fen(),
                history: this.state.game.history({ verbose: true }),
                pieceSquare: "",
            });
        }
    };

    // Function to get a move from an online Stockfish API based on fen notation and difficulty.
    getStockfishAPI = async (fen) => {
        const difficultyToDepth = { Easy: 1, Medium: 4, Hard: 8, Perfect: 15 };
        let difficulty =
            this.props.mode != "Analysis Mode"
                ? this.props.difficulty
                : "Perfect"; // Analysis mode uses maximum depth Stockfish
                
        // Construct API query
        let queryString = STOCKFISH_API_URI;
        queryString += "?fen=" + fen;
        queryString += "&depth=" + difficultyToDepth[difficulty];
        queryString += "&mode=bestmove";
        
        // Get and return response
        const response = await fetch(queryString);
        const json = await response.json();
        let firstSquare = json.bestmove.split(" ")[1].substring(0, 2);
        let secondSquare = json.bestmove.split(" ")[1].substring(2);
        return [firstSquare, secondSquare];
    };

    // Additional helpers
    getFenBasedOnCurrentPlayerSide = (fen, curPlayerSide) => {
        let parts = fen.split(" ");
        parts[1] = curPlayerSide[0] == "w" ? "b" : "w"; // opposite player side
        return parts.join(" ");
    };
    setPromotionPieceType = (type) => {
        this.setState({
            promotionPieceType: type,
        });
    };
    promotePiece = (pieceName) => {
        this.state.game.put(
            { type: pieceName, color: this.state.curPlayer[0] },
            this.state.square,
        );
    };

    // Renders the game board + timer
    render() {
        if (!this.state.gameStarted) {
            try {
                if (this.props.mode == "Analysis Mode") {
                    this.state.fen = this.props.startFen;
                    this.state.game = new Chess(this.props.startFen);
                }
            } catch (e) {
                this.state.game = new Chess();
            } finally {
                this.state.timerWhite.setTime(Number(this.props.gameLength));
                this.state.timerWhite.setIncr(Number(this.props.timerIncr));
                this.state.timerBlack.setTime(Number(this.props.gameLength));
                this.state.timerBlack.setIncr(Number(this.props.timerIncr));
            }
        }

        return (
            <View style={styles.container}>
                <View style={{ display: this.state.gameboardDisplay }}>
                    {/* Selected Square Indicator */}
                    <View
                        style={{
                            alignItems: "center",
                            display:
                                this.props.mode == "Pass-&-Play"
                                    ? "block"
                                    : "none",
                            transform: [{ rotate: "180deg" }],
                        }}
                    >
                        <Text>
                            {"Selected Square: " + this.state.pieceSquare}
                        </Text>
                    </View>
                    <View
                        display={
                            this.props.mode != "Analysis Mode" &&
                            Number(this.props.gameLength) > 0
                                ? "block"
                                : "none"
                        }
                    >
                        <View style={styles.timerContainer}>
                            <Text style={styles.whiteTimerText}>
                                {this.state.timerWhite.toString()}
                            </Text>
                            <Text style={styles.blackTimerText}>
                                {this.state.timerBlack.toString()}
                            </Text>
                        </View>
                    </View>

                    {/* Chessboard */}
                    <Chessboard
                        position={this.state.fen}
                        onSquarePress={this.onSquarePress}
                        boardWidth={"" + (2 * deviceHeight) / 5}
                        boardOrientation={this.props.boardOrientation}
                    />

                    {/* Timer/Recommended Move */}
                    <View
                        style={{
                            display:
                                this.props.mode == "Pass-&-Play" &&
                                Number(this.props.gameLength) > 0
                                    ? "block"
                                    : "none",
                        }}
                    >
                        <View style={styles.timerContainerUpsideDown}>
                            <Text style={styles.whiteTimerText}>
                                {this.state.timerWhite.toString()}
                            </Text>
                            <Text style={styles.blackTimerText}>
                                {this.state.timerBlack.toString()}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            display:
                                this.props.mode == "Analysis Mode"
                                    ? "block"
                                    : "none",
                        }}
                    >
                        <View style={styles.timerContainer}>
                            <Text style={styles.recommendedMoveWhiteText}>
                                {this.state.recommendedMoveWhite}
                            </Text>
                            <Text style={styles.recommendedMoveBlackText}>
                                {this.state.recommendedMoveBlack}
                            </Text>
                        </View>
                    </View>

                    <View style={{ alignItems: "center" }}>
                        {/* Check/checkmate message */}
                        <View
                            style={{ display: this.state.checkMessageDisplay }}
                        >
                            <Text style={styles.checkMessageText}>
                                {" "}
                                CHECK.{" "}
                            </Text>
                        </View>
                        <View
                            style={{
                                display: this.state.endgameMessageDisplay,
                            }}
                        >
                            <Text style={styles.checkMessageText}>
                                {" "}
                                {this.state.endgameMessage}{" "}
                            </Text>
                        </View>
                        {/* Selected Square Indicator */}
                        <Text>
                            {"Selected Square: " + this.state.pieceSquare}
                        </Text>
                        {/* Back Button */}
                        <TouchableHighlight
                            style={styles.backButton}
                            onPress={() => {
                                this.resetAll();
                                this.props.goBackToHome();
                            }}
                        >
                            <Text style={styles.backButtonText}>
                                ← END GAME
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "space-around",
        alignItems: "center",
    },
    timerContainer: {
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#b3e5ff",
    },
    timerContainerUpsideDown: {
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#b3e5ff",
        transform: [{ rotate: "180deg" }],
    },
    blackTimerText: {
        color: "black",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    whiteTimerText: {
        color: "white",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    checkMessageText: {
        color: "red",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    backButton: {
        backgroundColor: "green",
        height: deviceHeight / 16,
        width: deviceHeight / 4,
        alignItems: "center",
        justifyContent: "center",
        margin: deviceHeight / 32,
        marginLeft: deviceHeight / 32,
    },
    backButtonText: {
        color: "white",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    chessPiecesRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        height: deviceHeight / 20,
        margin: deviceHeight / 128,
    },
    chessPiece: {
        height: deviceHeight / 20,
        width: deviceHeight / 20,
    },
    recommendedMoveWhiteText: {
        fontSize: deviceHeight / 48,
        fontWeight: "bold",
        color: "white",
    },
    recommendedMoveBlackText: {
        fontSize: deviceHeight / 48,
        fontWeight: "bold",
        color: "black",
    },
    promotionOkButton: {
        backgroundColor: "green",
        height: deviceHeight / 20,
        width: deviceHeight / 20,
    },
    promotionOkButtonText: {
        color: "white",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
});

