// Imports
import { StatusBar } from "expo-status-bar";
import {
    AppRegistry,
    Text,
    View,
    StyleSheet,
    Image,
    TextInput,
    ImageBackground,
    TouchableHighlight,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    Dimensions,
    ScrollView,
    Linking,
} from "react-native";
import React, { Component } from "react";
import { Chessboard } from "chessboard-rn";
import { Chess } from "chess.js";
import { ChessGame } from "./ChessGame.tsx";
import { AnalyzeModeSetup } from "./AnalyzeModeSetup.tsx";

// Image URIs
let BLACK_CROWN = require("./images/Black Crown.png");
let WHITE_CROWN = require("./images/White Crown.png");
let HALF_AND_HALF_CROWN = require("./images/Half and Half Crown.png");
let LOGO_CHESS = require("./images/White Text Chess.png");
let LOGO_MASTERS = require("./images/Purple Text Masters.png");

// External webpage URIs
let CHESS_RULES_WEBPAGE_URL = "https://www.chess.com/learn-how-to-play-chess";
let CHESS_RULES_VIDEO_URL = "https://www.youtube.com/watch?v=OCSbzArwB10";

// Screen dimensions
let deviceHeight = Dimensions.get("window").height;
let deviceWidth = Dimensions.get("window").width;

// Used for proportional sizing of the logo.
let LOGO_ASPECT_RATIO_CHESS = 450 / 118;
let LOGO_ASPECT_RATIO_MASTERS = 500 / 118;

// Theme colors
let gold = "#d4af37";
let silver = "#b8b8b8";
let cyan = "#b5e6e6";

export default class App extends Component {
    state = {
        // State for each display
        homePageDisplay: "block",
        gameSetupPageDisplay: "none",
        passAndPlayPageDisplay: "none",
        playVsComputerPageDisplay: "none",
        analyzeModeSetupPageDisplay: "none",
        analyzeModePageDisplay: "none",
        learnTheRulesPageDisplay: "none",
        // Mode: Pass and Play, Play vs Computer, Analysis Mode
        mode: "",
        // Game state        
        startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        gameLength: 60,
        gameTimeIncr: 0,
        selectedTimeButton: "1 min",
        selectedOrientationButton: "white",
        customTime: "none",
        boardOrientation: "white",
        gameDifficulty: "Easy",
    };
    
    // Hide each screen so the appropriate one can be shown afterward
    clearAllPageDisplays = () => {
        this.setState({
            homePageDisplay: "none",
            gameSetupPageDisplay: "none",
            passAndPlayPageDisplay: "none",
            playVsComputerPageDisplay: "none",
            analyzeModeSetupPageDisplay: "none",
            analyzeModePageDisplay: "none",
            learnTheRulesPageDisplay: "none",
        });
    };

    /*
        Functions to handle page navigation
    */
    // Home page
    handleHomePagePress = () => {
        this.clearAllPageDisplays();
        this.setState({
            homePageDisplay: "block",
            mode: "Home",
        });
    };
    
    // Game setup page
    handleGameSetupPagePress = (gameType) => {
        this.clearAllPageDisplays();
        this.setState({
            gameSetupPageDisplay: "block",
            mode: gameType,
            gameLength: 60,
            gameTimeIncr: 0,
            selectedTimeButton: "1 min",
        });
        if (gameType == "Play vs Computer") {
            this.setBoardOrientation("white");
        }
    };

    // Analysis mode page
    handleAnalyzeModeSetupPagePress = () => {
        this.clearAllPageDisplays();
        this.setState({
            analyzeModeSetupPageDisplay: "block",
            mode: "Analysis Mode",
        });
    };

    // Game screen
    goToGameScreen = () => {
        this.clearAllPageDisplays();
        if (this.state.mode == "Pass-&-Play") {
            this.setState({
                passAndPlayPageDisplay: "block",
            });
        } else if (this.state.mode == "Play vs Computer") {
            this.setState({
                playVsComputerPageDisplay: "block",
            });
        } else {
            // console.log("going to AnalyzeMode game screen, startFen="+this.state.startFen);
            this.setState({
                analyzeModePageDisplay: "block",
            });
        }
    };

    // Rules page
    handleLearnTheRulesPagePress = () => {
        this.clearAllPageDisplays();
        this.setState({
            learnTheRulesPageDisplay: "block",
        });
    };
    
    // Orients the board relative to the screen.
    // orientation: Whether black or white should be on the bottom of the screen.
    setBoardOrientation = (orientation) => {
        this.setState({
            boardOrientation: orientation,
        });
    };
    
    // Sets the number of seconds the game should last, and seconds
    // added after each player move.
    setGameLengthAndTimeIncr = (len, time) => {
        this.setState(
            {
                gameLength: len * 60,
                gameTimeIncr: time,
            },
            () => {},
        );
    };

    // Sets the number of seconds the game should last.
    setGameLength = (len) => {
        this.setState(
            {
                gameLength: len * 60,
            },
            () => {},
        );
    };

    // Sets the number of seconds added after each player move.
    setGameTimeIncr = (time) => {
        this.setState(
            {
                gameTimeIncr: time,
            },
            () => {},
        );
    };
    
    // Sets game difficulty to easy, medium, hard, or perfect/impossible.
    setGameDifficulty = (difficulty) => {
        this.setState({
            gameDifficulty: difficulty,
        });
    };
    
    // Sets starting board position for the game.
    setStartFen = async (fen) => {
        await this.setState({
            startFen: fen,
        });
    };

    // Opens URL to an external webpage.
    openURL = async (url) => {
        await Linking.openURL(url);
    };

    // Render the app
    render() {
        return (
            // Wrap in TouchableWithoutFeedback due to iOS keyboard issue
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    { /* Home page components */ }
                    <View style={{ display: this.state.homePageDisplay }}>
                        <View style={styles.homePage}>
                            { /* Logo */ }
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            
                            { /* Game modes */ }
                            <View style={{ justifyContent: "space-around" }}>
                                { /* Pass and play */ }
                                <TouchableHighlight
                                    style={styles.selectGameButton}
                                    onPress={() =>
                                        this.handleGameSetupPagePress(
                                            "Pass-&-Play",
                                        )
                                    }
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Pass-&-Play
                                    </Text>
                                </TouchableHighlight>
                                { /* Play vs Computer */ }
                                <TouchableHighlight
                                    style={styles.selectGameButton}
                                    onPress={() =>
                                        this.handleGameSetupPagePress(
                                            "Play vs Computer",
                                        )
                                    }
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Play vs Computer
                                    </Text>
                                </TouchableHighlight>
                                { /* Analysis mode */ }
                                <TouchableHighlight
                                    style={styles.selectGameButton}
                                    onPress={
                                        this.handleAnalyzeModeSetupPagePress
                                    }
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Analysis Mode
                                    </Text>
                                </TouchableHighlight>
                                { /* Rules page */ }
                                <TouchableHighlight
                                    style={styles.selectGameButton}
                                    onPress={this.handleLearnTheRulesPagePress}
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Learn the Rules
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>

                    { /* Game setup UI components */ }
                    <View style={{ display: this.state.gameSetupPageDisplay }}>
                        <View style={styles.gameSetupPageView}>
                            { /* Logo */ }
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            
                            { /* Time control */ }
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display:
                                        this.state.mode != "Analysis Mode"
                                            ? "block"
                                            : "none",
                                }}
                            >
                                <Text style={styles.gameSetupFieldText}>
                                    Time Control
                                </Text>

                                <View
                                    style={{
                                        height: deviceHeight / 16,
                                        width: deviceHeight / 6,
                                        backgroundColor: cyan,
                                    }}
                                >
                                    { /* Scroll to select the time */ }
                                    <ScrollView>
                                        <TouchableHighlight
                                            onPress={() => {
                                                this.setGameLengthAndTimeIncr(1, 0);
                                                this.setState({
                                                    customTime: "none",
                                                    selectedTimeButton: "1 min",
                                                });
                                            }}
                                            style={{
                                                backgroundColor:
                                                    this.state
                                                        .selectedTimeButton ==
                                                    "1 min"
                                                        ? gold
                                                        : cyan,
                                            }}
                                        >
                                            <Text style={styles.timeScrollText}>
                                                1 min
                                            </Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            onPress={() => {
                                                this.setGameLengthAndTimeIncr(2, 0);
                                                this.setState({
                                                    customTime: "none",
                                                    selectedTimeButton: "2 min",
                                                });
                                            }}
                                            style={{
                                                backgroundColor:
                                                    this.state
                                                        .selectedTimeButton ==
                                                    "2 min"
                                                        ? gold
                                                        : cyan,
                                            }}
                                        >
                                            <Text style={styles.timeScrollText}>
                                                2 min
                                            </Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            onPress={() => {
                                                this.setGameLengthAndTimeIncr(5, 0);
                                                this.setState({
                                                    customTime: "none",
                                                    selectedTimeButton: "5 min",
                                                });
                                            }}
                                            style={{
                                                backgroundColor:
                                                    this.state
                                                        .selectedTimeButton ==
                                                    "5 min"
                                                        ? gold
                                                        : cyan,
                                            }}
                                        >
                                            <Text style={styles.timeScrollText}>
                                                5 min
                                            </Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            onPress={() => {
                                                this.setGameLengthAndTimeIncr(3, 2);
                                                this.setState({
                                                    customTime: "none",
                                                    selectedTimeButton: "3|2",
                                                });
                                            }}
                                            style={{
                                                backgroundColor:
                                                    this.state
                                                        .selectedTimeButton ==
                                                    "3|2"
                                                        ? gold
                                                        : cyan,
                                            }}
                                        >
                                            <Text style={styles.timeScrollText}>
                                                3|2
                                            </Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            onPress={() => {
                                                this.setGameLengthAndTimeIncr(-1, -1);
                                                this.setState({
                                                    customTime: "none",
                                                    selectedTimeButton:
                                                        "Infinite",
                                                });
                                            }}
                                            style={{
                                                backgroundColor:
                                                    this.state
                                                        .selectedTimeButton ==
                                                    "Infinite"
                                                        ? gold
                                                        : cyan,
                                            }}
                                        >
                                            <Text style={styles.timeScrollText}>
                                                Infinite
                                            </Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            onPress={() => {
                                                this.setGameLengthAndTimeIncr(0, 0);
                                                this.setState({
                                                    customTime: "block",
                                                    selectedTimeButton:
                                                        "Custom",
                                                });
                                            }}
                                            style={{
                                                backgroundColor:
                                                    this.state
                                                        .selectedTimeButton ==
                                                    "Custom"
                                                        ? gold
                                                        : cyan,
                                            }}
                                        >
                                            <Text style={styles.timeScrollText}>
                                                Custom
                                            </Text>
                                        </TouchableHighlight>
                                    </ScrollView>
                                </View>
                            </View>
                            
                            { /* Input to set custom time and increments */ }
                            <View style={{ display: this.state.customTime }}>
                                <View style={styles.customTimeContainer}>
                                    <View
                                        style={{
                                            alignItems: "center",
                                            margin: deviceHeight / 32,
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.customTimeInputLabelText
                                            }
                                        >
                                            Time
                                        </Text>
                                        <TextInput
                                            style={styles.customTimeInput}
                                            keyboardType="numeric"
                                            onChangeText={(len) =>
                                                this.setGameLength(len)
                                            }
                                            value={this.state.gameLength}
                                        />
                                    </View>

                                    <View
                                        style={{
                                            alignItems: "center",
                                            margin: deviceHeight / 32,
                                        }}
                                    >
                                        <Text
                                            style={
                                                styles.customTimeInputLabelText
                                            }
                                        >
                                            Increment
                                        </Text>
                                        <TextInput
                                            style={styles.customTimeInput}
                                            keyboardType="numeric"
                                            onChangeText={(time) =>
                                                this.setGameTimeIncr(time)
                                            }
                                            value={this.state.gameTimeIncr}
                                        />
                                    </View>
                                </View>
                            </View>

                            { /* Selection to pick which side to play: 
                            black, white or random */ }
                            <View
                                style={{
                                    display:
                                        this.state.mode == "Pass-&-Play" ||
                                        this.state.mode == "Analysis Mode"
                                            ? "block"
                                            : "none",
                                    flexDirection: "row",
                                    justifyContent: "space-around",
                                    width: deviceHeight / 4,
                                    margin: deviceHeight / 48,
                                }}
                            >
                                { /* White */ }
                                <TouchableHighlight
                                    onPress={() => {
                                        this.setState({
                                            boardOrientation: "white",
                                            selectedOrientationButton: "white",
                                        });
                                    }}
                                    style={{
                                        backgroundColor:
                                            this.state
                                                .selectedOrientationButton ==
                                            "white"
                                                ? gold
                                                : cyan,
                                    }}
                                >
                                    <Image
                                        source={WHITE_CROWN}
                                        style={{
                                            height: deviceHeight / 12,
                                            width: deviceHeight / 12,
                                        }}
                                    />
                                </TouchableHighlight>
                                { /* Random */ }
                                <TouchableHighlight
                                    onPress={() => {
                                        this.setState({
                                            boardOrientation:
                                                Math.random() < 0.5
                                                    ? "white"
                                                    : "black",
                                            selectedOrientationButton: "random",
                                        });
                                    }}
                                    style={{
                                        backgroundColor:
                                            this.state
                                                .selectedOrientationButton ==
                                            "random"
                                                ? gold
                                                : cyan,
                                    }}
                                >
                                    <Image
                                        source={HALF_AND_HALF_CROWN}
                                        style={{
                                            height: deviceHeight / 12,
                                            width: deviceHeight / 12,
                                        }}
                                    />
                                </TouchableHighlight>
                                { /* Black */ }
                                <TouchableHighlight
                                    onPress={() => {
                                        this.setState({
                                            boardOrientation: "black",
                                            selectedOrientationButton: "black",
                                        });
                                    }}
                                    style={{
                                        backgroundColor:
                                            this.state
                                                .selectedOrientationButton ==
                                            "black"
                                                ? gold
                                                : cyan,
                                    }}
                                >
                                    <Image
                                        source={BLACK_CROWN}
                                        style={{
                                            height: deviceHeight / 12,
                                            width: deviceHeight / 12,
                                        }}
                                    />
                                </TouchableHighlight>
                            </View>
                            
                            { /* Field to set game difficulty */ }
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <View
                                    style={{
                                        display:
                                            this.state.mode ==
                                            "Play vs Computer"
                                                ? "block"
                                                : "none",
                                    }}
                                >
                                    <Text style={styles.gameSetupFieldText}>
                                        Level
                                    </Text>
                                    <View
                                        style={{
                                            height: deviceHeight / 16,
                                            width: deviceHeight / 5,
                                            backgroundColor: cyan,
                                        }}
                                    >
                                        <ScrollView>
                                            <TouchableHighlight
                                                onPress={() =>
                                                    this.setGameDifficulty(
                                                        "Easy",
                                                    )
                                                }
                                                style={{
                                                    backgroundColor:
                                                        this.state
                                                            .gameDifficulty ==
                                                        "Easy"
                                                            ? gold
                                                            : cyan,
                                                }}
                                            >
                                                <Text
                                                    style={
                                                        styles.timeScrollText
                                                    }
                                                >
                                                    Easy
                                                </Text>
                                            </TouchableHighlight>

                                            <TouchableHighlight
                                                onPress={() =>
                                                    this.setGameDifficulty(
                                                        "Medium",
                                                    )
                                                }
                                                style={{
                                                    backgroundColor:
                                                        this.state
                                                            .gameDifficulty ==
                                                        "Medium"
                                                            ? gold
                                                            : cyan,
                                                }}
                                            >
                                                <Text
                                                    style={
                                                        styles.timeScrollText
                                                    }
                                                >
                                                    Medium
                                                </Text>
                                            </TouchableHighlight>

                                            <TouchableHighlight
                                                onPress={() =>
                                                    this.setGameDifficulty(
                                                        "Hard",
                                                    )
                                                }
                                                style={{
                                                    backgroundColor:
                                                        this.state
                                                            .gameDifficulty ==
                                                        "Hard"
                                                            ? gold
                                                            : cyan,
                                                }}
                                            >
                                                <Text
                                                    style={
                                                        styles.timeScrollText
                                                    }
                                                >
                                                    Hard
                                                </Text>
                                            </TouchableHighlight>

                                            <TouchableHighlight
                                                onPress={() =>
                                                    this.setGameDifficulty(
                                                        "Perfect",
                                                    )
                                                }
                                                style={{
                                                    backgroundColor:
                                                        this.state
                                                            .gameDifficulty ==
                                                        "Perfect"
                                                            ? gold
                                                            : cyan,
                                                }}
                                            >
                                                <Text
                                                    style={
                                                        styles.timeScrollText
                                                    }
                                                >
                                                    Perfect
                                                </Text>
                                            </TouchableHighlight>
                                        </ScrollView>
                                    </View>
                                </View>
                                
                                { /* Play button */ }
                                <TouchableHighlight
                                    style={styles.playGameButton}
                                    onPress={this.goToGameScreen}
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Fight!
                                    </Text>
                                </TouchableHighlight>
                                { /* Back button */ }
                                <TouchableHighlight
                                    style={styles.backButton}
                                    onPress={this.handleHomePagePress}
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        ← BACK
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                    
                    { /* Pass and play screen */ }
                    <View
                        style={{ display: this.state.passAndPlayPageDisplay }}
                    >
                        <View style={styles.chessGamePage}>
                            {/* Logo */}
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            
                            {/* Embedded Chess Game */}
                            <ChessGame
                                gameLength={"" + this.state.gameLength}
                                timerIncr={"" + this.state.gameTimeIncr}
                                goBackToHome={this.handleHomePagePress}
                                boardOrientation={this.state.boardOrientation}
                                mode={this.state.mode}
                            />
                        </View>
                    </View>

                    { /* Play vs Computer screen */ }
                    <View
                        style={{
                            display: this.state.playVsComputerPageDisplay,
                        }}
                    >
                        <View style={styles.chessGamePage}>
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            {/* Embedded Chess Game */}
                            <ChessGame
                                gameLength={"" + this.state.gameLength}
                                timerIncr={"" + this.state.gameTimeIncr}
                                goBackToHome={this.handleHomePagePress}
                                boardOrientation={this.state.boardOrientation}
                                mode={this.state.mode}
                                difficulty={this.state.gameDifficulty}
                            />
                        </View>
                    </View>

                    { /* Analysis mode page */ }
                    <View
                        style={{
                            display: this.state.analyzeModeSetupPageDisplay,
                        }}
                    >
                        <View style={styles.analyzeModeSetupPage}>
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            {/* Analysis Mode Setup */}
                            <AnalyzeModeSetup setStartFen={this.setStartFen} />
                            <TouchableHighlight
                                style={styles.playGameButton}
                                onPress={this.goToGameScreen}
                            >
                                <Text style={styles.selectGameButtonText}>
                                    Analyze!
                                </Text>
                            </TouchableHighlight>
                        </View>
                    </View>

                    <View
                        style={{ display: this.state.analyzeModePageDisplay }}
                    >
                        <View style={styles.chessGamePage}>
                            { /* Logo */ }
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            {/* Chess Game */}
                            <ChessGame
                                gameLength={"" + this.state.gameLength}
                                timerIncr={"" + this.state.gameTimeIncr}
                                goBackToHome={this.handleHomePagePress}
                                boardOrientation={this.state.boardOrientation}
                                mode={this.state.mode}
                                startFen={"" + this.state.startFen}
                            />
                        </View>
                    </View>
                    
                    { /* Rules page */ }
                    <View
                        style={{ display: this.state.learnTheRulesPageDisplay }}
                    >
                        <View style={styles.homePage}>
                            { /* Logo */ }
                            <View style={styles.titleContainer}>
                                <Image
                                    source={LOGO_CHESS}
                                    style={{
                                        height: deviceHeight / 24,
                                        width:
                                            (deviceHeight / 24) *
                                            LOGO_ASPECT_RATIO_CHESS,
                                    }}
                                />
                                <Image
                                    source={LOGO_MASTERS}
                                    style={{
                                        height: deviceHeight / 16,
                                        width:
                                            (deviceHeight / 16) *
                                            LOGO_ASPECT_RATIO_MASTERS,
                                    }}
                                />
                            </View>
                            
                            { /* Buttons to external links */ }
                            <View style={{ justifyContent: "space-around" }}>
                                <TouchableHighlight
                                    style={styles.selectGameButton}
                                    onPress={() =>
                                        this.openURL(CHESS_RULES_WEBPAGE_URL)
                                    }
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Read on Chess.com!
                                    </Text>
                                </TouchableHighlight>

                                <TouchableHighlight
                                    style={styles.selectGameButton}
                                    onPress={() =>
                                        this.openURL(CHESS_RULES_VIDEO_URL)
                                    }
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        Watch a Video
                                    </Text>
                                </TouchableHighlight>

                                <TouchableHighlight
                                    style={styles.backButton}
                                    onPress={this.handleHomePagePress}
                                >
                                    <Text style={styles.selectGameButtonText}>
                                        ← BACK
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: deviceHeight,
        width: deviceWidth,
    },
    homePage: {
        height: deviceHeight,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: gold,
    },
    chessGamePage: {
        height: deviceHeight,
        alignItems: "center",
        backgroundColor: gold,
    },
    analyzeModeSetupPage: {
        alignItems: "center",
        backgroundColor: gold,
        justifyContent: "space-between",
    },
    titleContainer: {
        height: deviceHeight / 4,
        //alignItems: 'center',
        justifyContent: "center",
    },
    selectGameView: {
        height: (3 * deviceHeight) / 4,
        justifyContent: "space-around",
        alignItems: "center",
    },
    selectGameButton: {
        backgroundColor: "green",
        height: deviceHeight / 16,
        width: deviceHeight / 3,
        alignItems: "center",
        justifyContent: "center",
        margin: deviceHeight / 32,
        marginLeft: deviceHeight / 32,
    },
    selectGameButtonText: {
        color: "white",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    gameSetupPageView: {
        height: deviceHeight,
        alignItems: "center",
        backgroundColor: silver,
    },
    gameSetupFieldText: {
        color: "white",
        fontSize: deviceHeight / 32,
        fontWeight: "bold",
    },
    timeScrollText: {
        color: "white",
        fontSize: deviceHeight / 48,
        fontWeight: "bold",
    },
    customTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    customTimeInput: {
        backgroundColor: "white",
        fontSize: deviceHeight / 32,
        width: deviceHeight / 8,
    },
    customTimeInputLabelText: {
        color: "green",
        fontSize: deviceHeight / 48,
        fontWeight: "bold",
    },
    playGameButton: {
        backgroundColor: "green",
        height: deviceHeight / 16,
        width: deviceHeight / 6,
        alignItems: "center",
        justifyContent: "center",
        margin: deviceHeight / 32,
        marginLeft: deviceHeight / 32,
    },
    backButton: {
        backgroundColor: "green",
        height: deviceHeight / 16,
        width: deviceHeight / 6,
        alignItems: "center",
        justifyContent: "center",
        margin: deviceHeight / 32,
        marginLeft: deviceHeight / 32,
    },
});
