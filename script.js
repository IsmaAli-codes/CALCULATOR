document.addEventListener("DOMContentLoaded", () => {
    const displayViewNode = document.getElementById("primary-numerical-view");
    const historyTrackerNode = document.getElementById("formula-history-tracker");
    
    let runtimeEvaluationString = "";
    let inputSessionResetFlag = false;

    // Direct event assignment mapper loops for numeric layout actions
    const operationalMatrixKeys = document.querySelectorAll(".calc-key-node:not(#calculate-total-trigger)");
    operationalMatrixKeys.forEach(key => {
        key.addEventListener("click", () => {
            const tokenValue = key.getAttribute("data-token");
            const commandValue = key.getAttribute("data-cmd");

            if (commandValue === "clear") {
                runtimeEvaluationString = "";
                historyTrackerNode.innerText = "";
                renderCalculatedView("0");
            } else if (commandValue === "delete") {
                runtimeEvaluationString = runtimeEvaluationString.slice(0, -1);
                renderCalculatedView(runtimeEvaluationString || "0");
            } else if (tokenValue) {
                processInputTokenFilter(tokenValue);
            }
        });
    });

    // Sanitizes and structures input streams before calculations execution
    function processInputTokenFilter(token) {
        if (inputSessionResetFlag && !isMathematicalOperator(token)) {
            runtimeEvaluationString = "";
        }
        inputSessionResetFlag = false;

        const lastEnteredCharacter = runtimeEvaluationString.slice(-1);

        // Blocks successive token assignments to avoid processing evaluation errors
        if (isMathematicalOperator(token) && isMathematicalOperator(lastEnteredCharacter)) {
            runtimeEvaluationString = runtimeEvaluationString.slice(0, -1) + token;
            renderCalculatedView(runtimeEvaluationString);
            return;
        }

        if (runtimeEvaluationString === "" && isMathematicalOperator(token) && token !== "-") {
            return;
        }

        runtimeEvaluationString += token;
        renderCalculatedView(runtimeEvaluationString);
    }

    function isMathematicalOperator(char) {
        return ["+", "-", "*", "/"].includes(char);
    }

    function renderCalculatedView(content) {
        displayViewNode.innerText = content.replace(/\*/g, "×").replace(/\//g, "÷");
    }

    // Safely evaluates strings via scoped Function initialization blocks
    document.getElementById("calculate-total-trigger").addEventListener("click", () => {
        if (!runtimeEvaluationString) return;

        try {
            historyTrackerNode.innerText = runtimeEvaluationString.replace(/\*/g, "×").replace(/\//g, "÷") + " =";
            
            let structuredOutput = Function(`"use strict"; return (${runtimeEvaluationString})`)();
            
            if (structuredOutput === Infinity || isNaN(structuredOutput)) {
                throw new Error("Invalid Balance");
            }

            runtimeEvaluationString = String(structuredOutput);
            renderCalculatedView(runtimeEvaluationString);
            inputSessionResetFlag = true;
        } catch (err) {
            renderCalculatedView("Error");
            runtimeEvaluationString = "";
            inputSessionResetFlag = true;
        }
    });
});
