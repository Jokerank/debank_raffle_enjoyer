// ==UserScript==
// @name         debank_raffle_enjoyer
// @namespace    http://tampermonkey.net/
// @version      0.7.1
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
    let switchForCustomPrice = true

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
        // Никуда ничего не отправляется, relax
        // По дефолту выключен - Кнопка 429 Check
        // Alert рейтлимита просто пример и выключение скрипта
        // Тут можно очень грязные штуки делать, по типу редиректов реквестов, пытался делать сортировку только по гивам, но это привело к проблемам
        // Сделал редирект новостной ленты с мейна на твинк, все работало кроме кое каких моментов, в объекте есть is_following и is_joined, т.е выводится лента сразу с
        // заполненными значениями, если перезаписать их, скрипт будет пытаться зафолловиться (даже если подписан) или зайти (даже если уже зашел), и быстро ловить 429
        // Т.е надо переписывать всю логику и как то запиливать подгрузку, пытался подменить пару фоновых запросов, но это не привело к подгрузке гивов.
        // После вывода онли гивов не работает нативная подгрузка остальных постов 🫡

        // Пример модификации запроса:
        // let account = "тут ваш акк random_id и прочая хрень которая передается в запросах почти всех" // Найти можно в F12 - Network - Headers - Request Headers - Account:
        // if (url.includes('https://api.debank.com/feed/list?limit=50&create_at=' && turn)) {
        //         // Тут идет парс таймштампа который в оригинальном запросе
        //         let regex = /create_at=([\d.]+)/;
        //         let match = regex.exec(url);
        //         let extractedValue = match ? match[1] : null;
        // let address = "0xВашАдрес"
        // // Тут вставляем хедерсы свои, в таком формате, переменную аккаунт берем сверху, костыльный обход x-api генерации
        // let customHeaders = {
        //     "accept": "*/*",
        //     "accept-language": "",
        //     "account": account,
        //     "sec-ch-ua": "",
        //     "sec-ch-ua-mobile": "",
        //     "sec-ch-ua-platform": "",
        //     "sec-fetch-dest": "",
        //     "sec-fetch-mode": "",
        //     "sec-fetch-site": "",
        //     "source": "",
        // }
        //  // Редирект адреса на другой
        //         url = `https://api.debank.com/feed/list?limit=50&create_at=${extractedValue}&user_id=${address}`
        //         // Объединение существующих заголовков с вашими заголовками
        //         const newHeaders = { ...options.headers, ...customHeaders };
        
        //         // Переопределение объекта опций запроса с новыми заголовками
        //         options = {
        //             ...options,
        //             headers: newHeaders,
        //         };
        
        //         const response = await originalFetch(url, options);
        //         const responseClone = await response.clone()
        //         let responseDataObject;
        //         try {
        //             responseDataObject = await responseClone.json();
        //         } catch (error) {
        //             // Обработка ошибок при парсинге JSON
        //             console.error('Error parsing JSON:', error);
        //             return response; // Возвращаем оригинальный ответ без изменений
        //         }
        //         // console.log(responseDataObject);
        //         // Важная функция, выполняет модификацию объекта который получен в запросе, с ним можно играть как душе угодно, выводить онли гивы как и писал, редактировать is_following, is_joined и т.д
        //         function modifyArray(responseDataObject) {
        //             return responseDataObject.data.feeds.map(item => {
        //             let modifiedItem = { ...item };
        //             // Модифицируем "is_following" и "is_joined"
        //             if (modifiedItem.article.draw_id != undefined || null) {
        //                 modifiedItem.article.creator.is_following = false
        //                 modifiedItem.article.draw.is_joined = false
        //             }
        //             return modifiedItem;
        //         })}
               
        //         modifyArray(responseDataObject);
               
        //         return new Response(JSON.stringify(responseDataObject), response);
        //     }
        // // Если придумаю что-то, запилю апдейт, но скорее всего это последний 🥲

        const originalFetch = window.fetch;
            window.fetch = async function (url, options) {
                const response = await originalFetch(url, options)

                if (rateL) {
                    // console.log(response.status)

                    if (response.status === 429) {
                            alert("You got a rate limit, maybe u need to edit some settings 🥲 The script will be disabled 🫡")
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
            let prizeTitle = "RichTextView_prizeTitle__5wXAk"
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
                
                let buttonElement = element.querySelector('button');
                let trustButton = element.getElementsByClassName("ArticleContent_opIconWrap__3YjdX")[3]
                let repostButton = element.getElementsByClassName("ArticleContent_opIconWrap__3YjdX")[1]

                let skip = false
                
                // // Сомнительная штука т.к иногда посты внизу вылазят, с розыгрышами которые новые, если кто читает можете потестить и раскомментировать, остановка при 'Sorry, you did not get the prize'
                // // По логике это должны быть старые посты, которые уже нет смысла просто так листать
                // // Выделить весь блок + нажать CTRL+ /
                // if (postTYPE == 'CASH PRIZE' && thickDesc == 'Sorry, you did not get the prize') {
                //     if (notifyOnlyOnce == 0) {
                //         alert("Looks like posts for today are over.")
                //         ++notifyOnlyOnce
                //     }
                //     skip = true
                //     state = false
                //     styleButtons(button, "Run DeBank Enjoyer 🫡", "#4CAF50", "180px", "32px")
                // }
                // else if (!buttonElement) {

                if (!buttonElement) { // И тут закомментировать строку
                    skip = true
                } else {
                    if (!switchForCustomPrice) {
                        skip = false
                    } else {
                        if (postTYPE == 'CUSTOM PRIZE' && switchForCustomPrice) {
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
                let feedListItem = visibleFeed.getElementsByClassName("ArticleContent_articleMain__2EFKB FeedListItem_content__2XFtk")
                
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

    styleButtons(switchButton, "Skip Custom Price ON 👌", "#00c087", "180px", "32px")

    switchButton.addEventListener("click", function() {
            switch (switchForCustomPrice) {
                case true:
                    switchForCustomPrice = false
                    updateStyle(switchButton, `Skip Custom Price OFF 🥴`, "#fe815f")
                    break;
                case false:
                    switchForCustomPrice = true
                    updateStyle(switchButton, `Skip Custom Price ON 👌`, "#00c087")
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

        updateSwitchState(RateLimitChecker, rateL, "429 Check", ["🔔", "🔕"])
        styleButtons(RateLimitChecker, null, null)

        RateLimitChecker.addEventListener("click", function() {
            switch (rateL) {
                case false:
                    rateL = true
                    updateSwitchState(RateLimitChecker, rateL, "429 Check", ["🔔", "🔕"])
                    requestListener()
                    break;
                case true:
                    rateL = false
                    updateSwitchState(RateLimitChecker, rateL, "429 Check", ["🔔", "🔕"])
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
