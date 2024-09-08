import React, { Component } from "react";
import {
    View,
    Dimensions,
    StyleSheet,
    Text,
    TouchableHighlight,
    Image,
} from "react-native";
import { Chessboard } from "chessboard-rn";
import { Chess } from "chess.js";

let deviceHeight = Dimensions.get("window").height;

// Pieces
let blackPieces = [
    { name: "bb", uri: require("./images/pieces/bb.png") },
    { name: "bk", uri: require("./images/pieces/bk.png") },
    { name: "bn", uri: require("./images/pieces/bn.png") },
    { name: "bp", uri: require("./images/pieces/bp.png") },
    { name: "bq", uri: require("./images/pieces/bq.png") },
    { name: "br", uri: require("./images/pieces/br.png") },
];
let whitePieces = [
    { name: "wb", uri: require("./images/pieces/wb.png") },
    { name: "wk", uri: require("./images/pieces/wk.png") },
    { name: "wn", uri: require("./images/pieces/wn.png") },
    { name: "wp", uri: require("./images/pieces/wp.png") },
    { name: "wq", uri: require("./images/pieces/wq.png") },
    { name: "wr", uri: require("./images/pieces/wr.png") },
];
let allPieces = blackPieces.concat(whitePieces);

// Colors
let silver = "#b8b8b8";
let cyan = "#b5e6e6";

// Logic for setting up a board position to analyze
export class AnalyzeModeSetup extends Component {
    state = {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        playerSide: "black",
        selectedPieceType: null,
        selectedSquare: "",
        game: new Chess(),
    };

    constructor(props) {
        super(props);
    }

    // Add piece to the board
    addPiece = (pieceType, square) => {
        if (pieceType != null && square != "") {
            this.state.game.put(
                { type: pieceType.name[1], color: pieceType.name[0] },
                square,
            );
            this.setState({
                fen: this.state.game.fen(),
            });
            this.props.setStartFen(this.state.game.fen());
        }
    };

    // Remove piece from the board
    removePiece = (square) => {
        if (square != "") {
            this.state.game.remove(square);
            this.setState({
                fen: this.state.game.fen(),
            });
        }
        this.props.setStartFen(this.state.game.fen());
    };

    // Select which square to put the piece on
    setSelectedSquare = (square) => {
        this.setState({
            selectedSquare: square,
        });
    };

    // Select or de-select a certain piece type
    // to put on the board.
    setOrToggleSelectedPieceType = (piece) => {
        if (this.state.selectedPieceType == piece) {
            this.setState({
                selectedPieceType: null,
            });
        } else {
            this.setState({
                selectedPieceType: piece,
            });
        }
    };

    clearSelectedPiece = () => {
        this.setSelectedPieceType(null);
    };

    render() {
        return (
            <View style={styles.container}>
                {/* Chess Piece Buttons */}
                <View style={{ margin: deviceHeight / 128 }}>
                    <View style={styles.chessPiecesRow}>
                        {whitePieces.map((piece) => (
                            <TouchableHighlight
                                onPress={() =>
                                    this.setOrToggleSelectedPieceType(piece)
                                }
                                style={{
                                    backgroundColor:
                                        this.state.selectedPieceType == piece
                                            ? silver
                                            : cyan,
                                }}
                            >
                                <Image
                                    source={piece.uri}
                                    style={styles.chessPiece}
                                />
                            </TouchableHighlight>
                        ))}
                    </View>
                    <View style={styles.chessPiecesRow}>
                        {blackPieces.map((piece) => (
                            <TouchableHighlight
                                onPress={() =>
                                    this.setOrToggleSelectedPieceType(piece)
                                }
                                style={{
                                    backgroundColor:
                                        this.state.selectedPieceType == piece
                                            ? silver
                                            : cyan,
                                }}
                            >
                                <Image
                                    source={piece.uri}
                                    style={styles.chessPiece}
                                />
                            </TouchableHighlight>
                        ))}
                    </View>
                </View>

                {/* Chessboard */}
                <Chessboard
                    position={this.state.fen}
                    onSquarePress={this.setSelectedSquare}
                    boardWidth={"" + (3 * deviceHeight) / 8}
                    boardOrientation={this.props.boardOrientation}
                />

                <Text>{"Selected Square: " + this.state.selectedSquare}</Text>

                <View style={{ flexDirection: "row" }}>
                    {/* Remove Piece Button */}
                    <TouchableHighlight
                        style={styles.removePieceButton}
                        onPress={() => {
                            this.removePiece(this.state.selectedSquare);
                        }}
                    >
                        <Text style={styles.buttonText}>X</Text>
                    </TouchableHighlight>
                    {/* Add Piece Button */}
                    <TouchableHighlight
                        style={styles.addPieceButton}
                        onPress={() => {
                            this.addPiece(
                                this.state.selectedPieceType,
                                this.state.selectedSquare,
                            );
                        }}
                    >
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    chessPiecesRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        height: deviceHeight / 20,
    },
    chessPiece: {
        height: deviceHeight / 20,
        width: deviceHeight / 20,
    },
    removePieceButton: {
        backgroundColor: "red",
        height: deviceHeight / 16,
        width: deviceHeight / 16,
        alignItems: "center",
        justifyContent: "center",
        margin: deviceHeight / 32,
        marginLeft: deviceHeight / 32,
    },
    addPieceButton: {
        backgroundColor: "green",
        height: deviceHeight / 16,
        width: deviceHeight / 16,
        alignItems: "center",
        justifyContent: "center",
        margin: deviceHeight / 32,
        marginLeft: deviceHeight / 32,
    },
});

