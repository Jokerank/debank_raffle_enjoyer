// ==UserScript==
// @name         debank_raffle_enjoyer
// @namespace    http://tampermonkey.net/
// @version      0.6.0
// @description  DeBank automatic raffles joiner!
// @author       Jokerank
// @match        *://*debank.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=debank.com
// @updateURL        https://raw.githubusercontent.com/Jokerank/debank_raffle_enjoyer/main/debank_raffle_enjoyer.js
// @downloadURL      https://raw.githubusercontent.com/Jokerank/debank_raffle_enjoyer/main/debank_raffle_enjoyer.js
// @supportURL       https://github.com/Jokerank/debank_raffle_enjoyer/issues
// @homepageURL      https://github.com/Jokerank/debank_raffle_enjoyer/
// @grant        none
// ==/UserScript==

function startScript() {
    'use strict';

    let success = 0
    let errors = 0

    // Function to execute the main script
    let switchForCustomPrice = true

    let state = false
    let switchForRandT = true
    let scrollSpeed = 3000
    let scrollSpeedStages = 1

    function runMainScript() {
        if(state) {

            let joinTheDraw = "Button_button__1yaWD Button_is_primary__1b4PX RichTextView_joinBtn__3dHYH" // Массив
            let follow = "Button_button__1yaWD Button_is_primary__1b4PX FollowButton_followBtn__DtOgj JoinDrawModal_joinStepBtn__DAjP0"
            let repost = "Button_button__1yaWD Button_is_primary__1b4PX JoinDrawModal_joinStepBtn__DAjP0"
            let following = "FollowButton_follwing__2itpB"
            let reposted = "Button_button__1yaWD Button_is_gray__3nV7y Button_is_disabled__18BCT JoinDrawModal_joinStepBtn__DAjP0 JoinDrawModal_isSuccess__1EVms" // Тут два в массиве если подписан
            let successTitle = "JoinDrawModal_drawSuccessTitle__2bnFS" // Чек на саксесс
            let drawToken = "JoinDrawModal_tokenDesc__1PIxe" // Номер токена
            let joinTheLuckyDraw = "Button_button__1yaWD Button_is_primary__1b4PX JoinDrawModal_submitBtn__RJXvp" // Join The Lucky Draw
            let closeButton = "CommonModal_closeModalButton__1swng" // Кнопка для закрытия
            let qualified = "JoinDrawModal_inValidTag__3Sfee"
            let prizeTitle = "RichTextView_prizeTitle__5wXAk"
            let FollowingLimitReached = "CommonModal_title__ctoFt"

            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            let delayBetweenTasks = 3000

            async function startTask(element, index) {
                let postTYPE
                try {
                    postTYPE = element.getElementsByClassName(prizeTitle)[0].innerHTML // Ворк
                } catch (error) {
                    
                }
                
                let buttonElement = element.querySelector('button');
                let trustButton = element.getElementsByClassName("ArticleContent_opIconWrap__3YjdX")[3]
                let repostButton = element.getElementsByClassName("ArticleContent_opIconWrap__3YjdX")[1]

                let skip = false
                if (!buttonElement) {
                    skip = true
                } else {
                    if (!switchForCustomPrice) {
                        skip = false
                    } else {
                        if (postTYPE == 'Custom Prize' && switchForCustomPrice) {
                            skip = true
                        } else if (postTYPE === undefined || null) {
                            skip = true
                        }
                    }
                }
                if (!skip && state) {
                    await delay(200)
                    buttonElement.click()
                    await delay(2000)
                    let qualifiedORnot = document.getElementsByClassName(qualified).length
                    if (qualifiedORnot > 0) {
                        console.log(`Task - ${index} does not meet the conditions, exit!`)
                        ++errors
                        document.getElementsByClassName(closeButton)[0].click()
                        delayBetweenTasks = 0
                    } else {
                        if(switchForRandT) {
                            if (!repostButton.innerHTML.includes("var(--color-primary)")) { repostButton.click() }
                            if (!trustButton.innerHTML.includes("green")) { trustButton.click() }
                        }
                        try {
                            let followON = document.getElementsByClassName(follow)
                            for (let buttons of followON) {
                                buttons.click()
                                // let limitElement = document.getElementsByClassName(FollowingLimitReached)
                                // for (let element of limitElement) {
                                //     if (element.innerHTML == 'Following limit reached') {
                                //         alert("Following limit reached, clean up your friendlist 😎☝️")
                                //         button.click()
                                //         break
                                //     }
                                // }
                            }
                        } catch (err) {
                            console.log("Seems already pressed")
                            console.log(err)
                        }
                        try {
                            let repostON = document.getElementsByClassName(repost)
                            for (let buttons of repostON) {
                                buttons.click()
                            }
                        } catch (err) {
                            console.log("Seems already pressed")
                            console.log(err)
                        }

                        let interval = setInterval(() => {
                            let join = document.getElementsByClassName(joinTheLuckyDraw)
                            if (join.length == 1) {
                                join[0].click()
                            }
                            let congrats = document.getElementsByClassName(successTitle)
                            if (congrats.length == 1) {
                                try {
                                    let close = document.getElementsByClassName(closeButton)
                                    close[0].click()
                                    clearInterval(interval)
                                    ++success
                                } catch (err) {
                                    console.log(err)
                                    ++errors
                                }
                            }
                        }, 1000);
                    }
                    } else {
                        delayBetweenTasks = 0
                        console.log(`Skipped because of custom prize or because already registered - task: ${index}`)
                    }

            }


            function simulateScroll(callback) {
                // Specify the coordinates where you want to scroll to (in this example, scrolling to the Y-coordinate 1000)
                const scrollToY = callback;
                // Scroll the page to the specified coordinates
                window.scrollBy({
                    top: scrollToY,
                    behavior: 'smooth' // Use 'auto' for instant scrolling, or 'smooth' for smooth scrolling
                });
            }

            async function main() {
                if (state) {
                    button.textContent = "Running DeBank Enjoyer 🫡";
                    button.style.backgroundColor = "#ef7c39";
                    button.style.padding = "5px 2px";
                }
                let feedListItem = document.getElementsByClassName("ArticleContent_articleMain__2EFKB FeedListItem_content__2XFtk")
                
                if (feedListItem.length != 0 && state) {
                    console.log(`Loaded ${feedListItem.length} raffle/s`)

                    let index = 0

                    for (let element of feedListItem) {
                        delayBetweenTasks = 3000
                        await startTask(element, index)
                        await delay(delayBetweenTasks)
                        console.log(`Task done ${index}!`)
                        ++index
                    }
                } else {
                    console.log("Scrolling to find more raffles")
                    await delay(1000)
                }
                if (state) {
                    simulateScroll(scrollSpeed)
                    await delay(2000)
                    main()
                }
            }
            if (state) {
                 main()
            }
        }
    }

    // Create the button element
    const button = document.createElement("button");
    function runButtonDefault() {
        button.textContent = "Run DeBank Enjoyer 🫡";
        button.style.position = "fixed";
        button.style.backgroundColor = "#4CAF50";
        button.style.color = "white";
        button.style.padding = "5px 15px";
        button.style.fontSize = "14px";
        button.style.border = "none";
        button.style.width = "179px"
        button.style.height = "32px"
        button.style.borderRadius = "10px";
        button.style.zIndex = "9999"; // Set the z-index to make sure the button appears on top
    }
    runButtonDefault()

    // Append the button to the page
    // document.body.appendChild(button);

    // Set the button's click event to run the main script
    button.addEventListener("click", function(){
        switch (state) {
            case false:
                state = true
                runMainScript()
                break;
            case true:
                state = false
                runButtonDefault()
                break;
            default:
                break;
        }
    });

    const statisticsElement = document.createElement("div");
    statisticsElement.appendChild(button);
    const elmwithstatistic = document.createElement("div");
    statisticsElement.appendChild(elmwithstatistic);

    function updateStatisticsText() {
        elmwithstatistic.textContent = `\n\nStats:\nJoin in: ${success} raffles\nErrors: ${errors}\n`;
    }
    
    // Create the hyperlink element
    const debank = document.createElement("a");
    debank.href = "https://debank.com/profile/0xf890da5ab205741ebc49691eacfe127cffd90599/";
    debank.textContent = "DeBank ❤️ | ";

    statisticsElement.appendChild(document.createElement("br"));
    statisticsElement.appendChild(debank);

    const github = document.createElement("a");
    github.href = "https://github.com/Jokerank";
    github.textContent = "Github ❤️";

    // statisticsElement.appendChild(document.createElement("br"));
    statisticsElement.appendChild(github);

    const telegram = document.createElement("a");
    telegram.href = "https://t.me/investjk";
    telegram.textContent = "Telegram ❤️\n";

    statisticsElement.appendChild(document.createElement("br"));
    statisticsElement.appendChild(telegram);

    const switchButton = document.createElement("button");  

    statisticsElement.appendChild(document.createElement("br"));
    statisticsElement.appendChild(switchButton);
    switchButton.textContent = `Skip Custom Price ON 👌`
    switchButton.style.backgroundColor = "#00c087";
    switchButton.style.borderRadius = "10px";
    switchButton.style.color = "white";
    switchButton.style.fontSize = "12px";
    switchButton.style.width = "179px"
    switchButton.style.height = "32px"
    switchButton.addEventListener("click", function() {
            switch (switchForCustomPrice) {
                case true:
                    switchForCustomPrice = false
                    switchButton.textContent = `Skip Custom Price OFF 🥴`
                    switchButton.style.backgroundColor = "#fe815f";
                    break;
                case false:
                    switchForCustomPrice = true
                    switchButton.textContent = `Skip Custom Price ON 👌`
                    switchButton.style.backgroundColor = "#00c087";
                    break;
                default:
                    break;
            }
    })

        async function followORunfollow(mode) {

            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        
            let htmlCode = document.getElementsByClassName("FollowButton_followBtnIcon__cZE9v")
            if (htmlCode.length != 0) {
                for (let element of htmlCode) {
                    await otpiskaNahuyORpodpiska(element, mode)
                }
            } else {
                alert("Make sure you are on following or followers page")
            }
        
            async function otpiskaNahuyORpodpiska(element, mode) {
                try {                
                    let svgElement = element.querySelector('g');
                    let followORnot = svgElement.getAttribute("clip-path")
                    
                    if (mode == "Unfollow") {
                        if (followORnot == "url(#clip0_11356_89186)") {
                            console.log("Already Unfollowed")
                        } else {
                            console.log("Unfollowed")
                            await delay(200)
                            element.click()
                        }
                    }
                    if (mode == "Follow") {
                        if (followORnot == "url(#clip0_11356_89186)") {
                            console.log("Followed")
                            await delay(200)
                            element.click()
                        } else {
                            console.log("Already Followed")
                        }
                    }
                } catch (err) {
                    console.log(err) 
                }
            }
        }

        const friendsRemover = document.createElement("button");
        statisticsElement.appendChild(document.createElement("br"));
        statisticsElement.appendChild(friendsRemover);
        friendsRemover.textContent = `Bulk Unfollow`
        friendsRemover.style.backgroundColor = "#fe815f";
        friendsRemover.style.borderRadius = "10px";
        friendsRemover.style.color = "white";
        friendsRemover.style.fontSize = "12px";
        friendsRemover.style.width = "90px"
        friendsRemover.style.height = "32px"
        friendsRemover.addEventListener("click", function() {
            followORunfollow("Unfollow");
        })
        const friendsAdd = document.createElement("button");
        // statisticsElement.appendChild(document.createElement("br"));
        statisticsElement.appendChild(friendsAdd);
        friendsAdd.textContent = `Bulk Follow`
        friendsAdd.style.backgroundColor = "#fe815f";
        friendsAdd.style.borderRadius = "10px";
        friendsAdd.style.color = "white";
        friendsAdd.style.fontSize = "12px";
        friendsAdd.style.width = "90px"
        friendsAdd.style.height = "32px"
        friendsAdd.addEventListener("click", function() {
            followORunfollow("Follow");
        })
        
        const repostANDtrust = document.createElement("button");
        statisticsElement.appendChild(document.createElement("br"));
        statisticsElement.appendChild(repostANDtrust);
        repostANDtrust.textContent = `R&T ON`
        repostANDtrust.style.backgroundColor = "#00c087";
        repostANDtrust.style.borderRadius = "10px";
        repostANDtrust.style.color = "white";
        repostANDtrust.style.fontSize = "13px";
        repostANDtrust.style.width = "90px"
        repostANDtrust.style.height = "32px"
        repostANDtrust.addEventListener("click", function() {
            switch (switchForRandT) {
                case true:
                    switchForRandT = false
                    repostANDtrust.textContent = `R&T OFF`
                    repostANDtrust.style.backgroundColor = "#f63d3d";
                    break;
                case false:
                    repostANDtrust.textContent = `R&T ON`
                    repostANDtrust.style.backgroundColor = "#00c087";
                    switchForRandT = true
                    break;
                default:
                    break;
            }
        })
        const scrollSpeedButton = document.createElement("button");
        statisticsElement.appendChild(scrollSpeedButton);
        scrollSpeedButton.textContent = `Scroll Speed 😎`
        scrollSpeedButton.style.backgroundColor = "#00c087";
        scrollSpeedButton.style.borderRadius = "10px";
        scrollSpeedButton.style.color = "white";
        scrollSpeedButton.style.fontSize = "12px";
        scrollSpeedButton.style.width = "90px"
        scrollSpeedButton.style.height = "32px"
        scrollSpeedButton.addEventListener("click", function() {
            switch (scrollSpeedStages) {
                case 1:
                    scrollSpeed = 2000
                    scrollSpeedStages = 2
                    scrollSpeedButton.textContent = `Scroll Speed 🤨`
                    scrollSpeedButton.style.backgroundColor = "#d66853";                    
                    break;
                case 2:
                    scrollSpeed = 1000
                    scrollSpeedStages = 3
                    scrollSpeedButton.textContent = `Scroll Speed 🐢`
                    scrollSpeedButton.style.backgroundColor = "#bf8b32";
                    break;
                case 3:
                    scrollSpeed = 3000
                    scrollSpeedStages = 1
                    scrollSpeedButton.textContent = `Scroll Speed 😎`
                    scrollSpeedButton.style.backgroundColor = "#00c087";
                    break;
                default:
                    break;
            }
        })
    
        
    setInterval(() => {
        updateStatisticsText()
    }, 500);

    statisticsElement.style.whiteSpace = "pre-wrap";
    statisticsElement.style.position = "fixed";
    statisticsElement.style.bottom = "250px";
    statisticsElement.style.left = "10px";
    statisticsElement.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    statisticsElement.style.borderRadius = "10px";
    statisticsElement.style.color = "white";
    statisticsElement.style.padding = "10px";
    statisticsElement.style.fontSize = "16px";
    statisticsElement.style.zIndex = "9999"; // Set the z-index to make sure the text appears on top

    // Append the statistics element to the page
    document.body.appendChild(statisticsElement);
}
window.onload = startScript
