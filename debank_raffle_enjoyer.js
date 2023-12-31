// ==UserScript==
// @name         debank_raffle_enjoyer
// @namespace    http://tampermonkey.net/
// @version      0.7.4
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

(function () {
    'use strict';

    let success = 0
    let errors = 0

    // Function to execute the main script
    let switchForCustomPrize = true

    let state = false
    let switchForRandT = false
    let scrollSpeed = 3000
    let scrollSpeedStages = 1
    let delayStages = 1
    let rateLimitforScript = 3000
    let rateL = false

    // Style
    function updateStyle(element, textContent, color) {
        element.textContent = textContent
        element.style.backgroundColor = color
    }

    function updateSwitchState(element, switchStatus, name, arrayWithStatusONOFF) {
        if (switchStatus) {
            element.textContent = `${name} ${arrayWithStatusONOFF[0]}`
            element.style.backgroundColor = "#00c087";
        } else {
            element.textContent = `${name} ${arrayWithStatusONOFF[1]}`
            element.style.backgroundColor = "#f63d3d";
        }
    }

    function styleButtons(element, name, originalColor, width, height) {
        if (name != null || undefined) {
            element.textContent = name
        }
        if (originalColor != null || undefined) {
            element.style.backgroundColor = originalColor;
        }
        element.style.borderRadius = "10px";
        element.style.color = "white";
        element.style.fontSize = "11px";
        if (width != null || undefined) {
            element.style.width = width
        } else {
            element.style.width = "90px"
        }
        if (height != null || undefined) {
            element.style.height = height
        } else {
            element.style.height = "32px"
        }
    }
    // Style END
    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function requestListener() {

        const originalFetch = window.fetch;
            window.fetch = async function (url, options) {
                const response = await originalFetch(url, options)
                if (rateL) {
                const responseClone = await response.clone()
                let responseDataObject
                try {
                    responseDataObject = await responseClone.json();
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                }
                
                // console.log(responseDataObject)
                
                    // console.log(response.status)
                    // Тут простая проверка на ерроры с сервера
                    if (responseDataObject.error_code === 1) {
                        if (responseDataObject.error_msg == "You've hit your 24-hour join Lucky draw limit based on your Web3 Social Ranking") {
                            alert(`${responseDataObject.error_msg} 🥲\nThe script will be disabled 🫡`)
                            state = false
                            styleButtons(button, "Run DeBank Enjoyer 🫡", "#4CAF50", "180px", "32px")
                            rateL = false
                            updateSwitchState(RateLimitChecker, rateL, "Request 👂", ["🔔", "🔕"])
                        }
                    }

                    if (response.status === 429) {
                            alert("You got a rate limit, maybe u need to edit some settings 🥲\nThe script will be disabled 🫡")
                            state = false
                            styleButtons(button, "Run DeBank Enjoyer 🫡", "#4CAF50", "180px", "32px")
                    }

                    return response
                } else {
                    return response
                }
            }
            return originalFetch(url, options);
    }

    function runMainScript() {
        if(state) {

            let howMuchSeen = 0
            let arrayChecker = []

            async function endChecker() {
                    let arrayWithIndexes = []

                    let list = document.getElementsByClassName("ListContainer_streamListWrap__3w26c ListContainer_isVisible__13Ye8")[0]
                    let elementsWithIndex = list.querySelectorAll('div[data-index]');
                    
                    elementsWithIndex.forEach((element) => {
                    let dataIndexValue = element.dataset.index;
                        arrayWithIndexes.push(dataIndexValue)
                    });

                    if (arrayChecker.toString() === arrayWithIndexes.toString()) {
                        arrayChecker = arrayWithIndexes.slice();
                        ++howMuchSeen;
                    } else {
                        arrayChecker = arrayWithIndexes.slice();
                        howMuchSeen = 0
                    } // howMuchSeen 5 скорее всего сравнений достаточно, но оптимально останавливать после 3х поставил 5 для уверенности
                    if (howMuchSeen >= 5) {
                        alert("Looks like posts for today are over.")
                        state = false
                        styleButtons(button, "Run DeBank Enjoyer 🫡", "#4CAF50", "180px", "32px")
                        howMuchSeen = 0
                    }
            }

            let joinTheDraw = "Button_button__1yaWD Button_is_primary__1b4PX RichTextView_joinBtn__3dHYH" // Массив
            let follow = "Button_button__1yaWD Button_is_primary__1b4PX FollowButton_followBtn__DtOgj JoinDrawModal_joinStepBtn__DAjP0"
            let repost = "Button_button__1yaWD Button_is_primary__1b4PX JoinDrawModal_joinStepBtn__DAjP0"
            let following = "FollowButton_follwing__2itpB"
            let reposted = "Button_button__1yaWD Button_is_gray__3nV7y Button_is_disabled__18BCT JoinDrawModal_joinStepBtn__DAjP0 JoinDrawModal_isSuccess__1EVms" // Тут два в массиве если подписан
            let successTitle = "JoinDrawModal_drawSuccessTitle__2bnFS" // Чек на саксесс
            let drawToken = "JoinDrawModal_tokenDesc__1PIxe" // Номер токена
            let joinTheLuckyDraw = "Button_button__1yaWD Button_is_primary__1b4PX JoinDrawModal_submitBtn__RJXvp" // Join The Lucky Draw
            let closeButton = "CommonModal_closeModalButton__1swng" // Кнопка для закрытия
            let qualified = "InteractPermissions_inValidTag__2UemM" // class changed
            let prizeTitle = "DrawCard_prizeTitle__17X5G"
            let FollowingLimitReached = "FollowLimitModal_container__MJWF8"

            let notifyOnlyOnce = 0
            async function startTask(element, index) {
                let postTYPE
                let thickDesc
                try {
                    postTYPE = element.getElementsByClassName(prizeTitle)[0].outerText
                    thickDesc = element.getElementsByClassName("RichTextView_thickDesc__XyL5G")[0].outerText
                } catch (error) {
                    
                }
                
                let buttonElement = element.querySelectorAll('button');
                if (buttonElement.length > 1) {
                    buttonElement = buttonElement[buttonElement.length - 1];
                } else {
                    buttonElement = buttonElement[0]
                }
                let trustButton = element.getElementsByClassName("ArticleContent_opIconWrap__3YjdX")[3]
                let repostButton = element.getElementsByClassName("ArticleContent_opIconWrap__3YjdX")[1]

                let skip = false

                if (!buttonElement) { // И тут закомментировать строку
                    skip = true
                } else {
                    if (!switchForCustomPrize) {
                        skip = false
                    } else {
                        if (postTYPE == 'CUSTOM PRIZE' && switchForCustomPrize) {
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
                                let limitElement
                                if (state) {
                                    buttons.click()
                                    limitElement = document.getElementsByClassName(FollowingLimitReached)[0]
                                }

                                if (limitElement.innerHTML.includes('reached the maximum limit')) {
                                    if (notifyOnlyOnce == 0) {
                                        alert("Following limit reached, clean up your friendlist 😎☝️")
                                        button.click()
                                        ++notifyOnlyOnce
                                    }
                                    state = false
                                    break
                                }
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
                            if (state) { // после остановки интервал не сбрасывался в некоторых случаях, фикс
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
                            }
                            else {
                                clearInterval(interval)
                            }
                        }, 1000);
                    }
                    if (qualifiedORnot > 0) {
                        delayBetweenTasks = 0
                    } else {
                        delayBetweenTasks = rateLimitforScript
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
            
            let delayBetweenTasks = rateLimitforScript

            async function main() {
                if (state) {
                    styleButtons(button, "Running DeBank Enjoyer 🫡", "#ef7c39", "180px", "32px")
                }
                
                let visibleFeed = document.getElementsByClassName("ListContainer_streamListWrap__3w26c ListContainer_isVisible__13Ye8")[0] // devs again changed something
                if (!visibleFeed) {
                    // Фолловинг фикс
                    visibleFeed = document.getElementsByClassName("StreamTab_streamMain__3afzt")[0]  
                }
                let feedListItem = visibleFeed.getElementsByClassName("FeedListItem_streamListItem__1TJ_q")
                
                if (feedListItem.length != 0 && state) {
                    console.log(`Loaded ${feedListItem.length} post/s`)

                    let index = 0

                    for (let element of feedListItem) {
                        await startTask(element, index)
                        await delay(delayBetweenTasks)
                        console.log(delayBetweenTasks)
                        console.log(`Task done ${index}!`)
                        ++index
                    }
                } else {
                    console.log("Scrolling to find more raffles")
                    await delay(500)
                }
                if (state) {
                    simulateScroll(scrollSpeed)
                    endChecker()
                    await delay(1000)
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
        styleButtons(button, "Run DeBank Enjoyer 🫡", "#4CAF50", "180px", "32px")
        button.style.position = "fixed";
        button.style.zIndex = "9999"; // Set the z-index to make sure the button appears on top
    }
    runButtonDefault()

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

    statisticsElement.appendChild(github);

    const telegram = document.createElement("a");
    telegram.href = "https://t.me/investjk";
    telegram.textContent = "Telegram ❤️\n";

    statisticsElement.appendChild(document.createElement("br"));
    statisticsElement.appendChild(telegram);

    const switchButton = document.createElement("button");  

    statisticsElement.appendChild(document.createElement("br"));
    statisticsElement.appendChild(switchButton);

    styleButtons(switchButton, "Skip Custom Prize ON 👌", "#00c087", "180px", "32px")

    switchButton.addEventListener("click", function() {
            switch (switchForCustomPrize) {
                case true:
                    switchForCustomPrize = false
                    updateStyle(switchButton, `Skip Custom Prize OFF 🥴`, "#fe815f")
                    break;
                case false:
                    switchForCustomPrize = true
                    updateStyle(switchButton, `Skip Custom Prize ON 👌`, "#00c087")
                    break;
                default:
                    break;
            }
    })

        async function followORunfollow(mode) {
        
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

        styleButtons(friendsRemover, `Bulk Unfollow`, "#fe815f")

        friendsRemover.addEventListener("click", function() {
            followORunfollow("Unfollow");
        })

        const friendsAdd = document.createElement("button");
        statisticsElement.appendChild(friendsAdd);

        styleButtons(friendsAdd, `Bulk Follow`, "#fe815f")

        friendsAdd.addEventListener("click", function() {
            followORunfollow("Follow");
        })
        
        const repostANDtrust = document.createElement("button");
        statisticsElement.appendChild(document.createElement("br"));
        statisticsElement.appendChild(repostANDtrust);
        
        updateSwitchState(repostANDtrust, switchForRandT, "R&T", ["ON", "OFF"])
        styleButtons(repostANDtrust, null, null)

        repostANDtrust.addEventListener("click", function() {
            switch (switchForRandT) {
                case true:
                    switchForRandT = false
                    updateSwitchState(repostANDtrust, switchForRandT, "R&T", ["ON", "OFF"])
                    break;
                case false:
                    switchForRandT = true
                    updateSwitchState(repostANDtrust, switchForRandT, "R&T", ["ON", "OFF"])
                    break;
                default:
                    break;
            }
        })
        
        const scrollSpeedButton = document.createElement("button");
        statisticsElement.appendChild(scrollSpeedButton);

        styleButtons(scrollSpeedButton, `Scroll Speed 😎`, "#00c087")

        scrollSpeedButton.addEventListener("click", function() {
            switch (scrollSpeedStages) {
                case 1:
                    scrollSpeed = 2000
                    scrollSpeedStages = 2
                    updateStyle(scrollSpeedButton, `Scroll Speed 🤨`, "#d66853")                    
                    break;
                case 2:
                    scrollSpeed = 1000
                    scrollSpeedStages = 3
                    updateStyle(scrollSpeedButton, `Scroll Speed 🐢`, "#bf8b32")
                    break;
                case 3:
                    scrollSpeed = 3000
                    scrollSpeedStages = 1
                    updateStyle(scrollSpeedButton, `Scroll Speed 😎`, "#00c087")
                    break;
                default:
                    break;
            }
        })

        const rateLimitButton = document.createElement("button");
        statisticsElement.appendChild(document.createElement("br"));
        statisticsElement.appendChild(rateLimitButton);

        styleButtons(rateLimitButton, `Delay Task OFF`, "#fe815f")

        rateLimitButton.addEventListener("click", function() {
            switch (delayStages) {
                case 1:
                    rateLimitforScript = 10000
                    delayStages = 2
                    updateStyle(rateLimitButton, `Delay Task 🐢`, "#f63d3d")
                    break;
                case 2:
                    rateLimitforScript = 6000
                    delayStages = 3
                    updateStyle(rateLimitButton, `Delay Task 😈`, "#00c087")
                    break;
                case 3:
                    rateLimitforScript = 15000
                    delayStages = 4
                    updateStyle(rateLimitButton, `Sloth mode 🦥`, "#5F5F5F")
                    break;
                case 4:
                    rateLimitforScript = 3000
                    delayStages = 1
                    updateStyle(rateLimitButton, `Delay Task OFF`, "#fe815f")
                    break;
                default:
                    break;
            }
        })

        const RateLimitChecker = document.createElement("button");
        statisticsElement.appendChild(RateLimitChecker);

        updateSwitchState(RateLimitChecker, rateL, "Request 👂", ["🔔", "🔕"])
        styleButtons(RateLimitChecker, null, null)

        RateLimitChecker.addEventListener("click", function() {
            switch (rateL) {
                case false:
                    rateL = true
                    updateSwitchState(RateLimitChecker, rateL, "Request 👂", ["🔔", "🔕"])
                    requestListener()
                    break;
                case true:
                    rateL = false
                    updateSwitchState(RateLimitChecker, rateL, "Request 👂", ["🔔", "🔕"])
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
    statisticsElement.style.bottom = "210px";
    statisticsElement.style.left = "10px";
    statisticsElement.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    statisticsElement.style.borderRadius = "10px";
    statisticsElement.style.color = "white";
    statisticsElement.style.padding = "10px";
    statisticsElement.style.fontSize = "16px";
    statisticsElement.style.zIndex = "9999"; // Set the z-index to make sure the text appears on top

    // Append the statistics element to the page
    document.body.appendChild(statisticsElement);
})();
