import React, { Component } from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";

let deviceHeight = Dimensions.get("window").height;

// Class for a chess game timer.
export class Timer {
    state = {};

    // Set the amount of time on the timer.
    setTime(theTime) {
        this.state.time = Math.floor(Math.abs(theTime));
    }

    // Sets the amount of time to increment the timer by after a move.
    setIncr(theIncr) {
        this.state.incr = Math.floor(Math.abs(theIncr));
    }
    
    // Starts the timer
    // reloadFunction passed from parent to re-render the Timer.
    start(reloadFunction) {
        intervalTime = 1000; // Reload every 1000 ms
        this.interval = setInterval(() => {
            this.state.time--;
            if (this.state.time != null && this.state.time < 0) {
                this.state.time = 0;
            }
            reloadFunction();
        }, intervalTime);
    }
    
    // Pause the timer
    pause() {
        if (this.interval != null) clearInterval(this.interval);
    }
    
    
    reset() {
        if (this.interval != null) {
            clearInterval(this.interval);
        }
    }

    // Increment the time left
    increment() {
        this.state.time = this.state.time + this.state.incr;
    }
    
    // Text representation of the time left
    toString() {
        seconds = "" + Math.floor(this.state.time % 60);
        if (seconds.length == 1) {
            seconds = "0" + seconds;
        }
        return "" + Math.floor(this.state.time / 60) + ":" + seconds;
    }
}

