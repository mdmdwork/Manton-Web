const notyf = new Notyf({
    position: {x: "center", y: "top"},
    types: [
        {
            type: "success",
            background: "#99c959",
            duration: 2000,
        },
        {
            type: "error",
            background: "#e15b64",
            duration: 3000,
        }
    ]
});
const windowEle = document.getElementsByClassName("chat_window")[0];
const messagsEle = document.getElementsByClassName("messages")[0];
const chatlog = document.getElementById("chatlog");
const stopEle = document.getElementById("stopChat");
const sendBtnEle = document.getElementById("sendbutton");
const clearEle = document.getElementsByClassName("clearConv")[0];
const textarea = document.getElementById("chatinput");
const settingEle = document.getElementById("setting");
const dialogEle = document.getElementById("setDialog");
const lightEle = document.getElementById("toggleLight");
const setLightEle = document.getElementById("setLight");
const autoThemeEle = document.getElementById("autoDetail");
const systemEle = document.getElementById("systemInput");
const speechServiceEle = document.getElementById("preSetService");
const newChatEle = document.getElementById("newChat");
const folderListEle = document.getElementById("folderList");
const chatListEle = document.getElementById("chatList");
const searchChatEle = document.getElementById("searchChat");
const voiceRecEle = document.getElementById("voiceRecIcon");
const voiceRecSetEle = document.getElementById("voiceRecSetting");
let voiceType = 1; // 设置 0: 提问语音，1：回答语音
let voiceRole = []; // 语音
let voiceVolume = []; //音量
let voiceRate = []; // 语速
let voicePitch = []; // 音调
let enableContVoice; // 连续朗读
let enableAutoVoice; // 自动朗读
let existVoice = 2; // 3:Azure语音 2:使用edge在线语音, 1:使用本地语音, 0:不支持语音
let azureToken;
let azureTokenTimer;
let azureRegion;
let azureKey;
let azureRole = [];
let azureStyle = [];
let isSafeEnv = location.hostname.match(/127.|localhost/) || location.protocol.match(/https:|file:/); // https或本地安全环境
let supportRec = !!window.webkitSpeechRecognition && isSafeEnv; // 是否支持语音识别输入
let recing = false;
let toggleRecEv;
const noLoading = () => {
    return !loading && (!currentResEle || currentResEle.dataset.loading !== "true")
}
textarea.focus();
const textInputEvent = () => {
    if (noLoading()) {
        if (textarea.value.trim().length) {
            sendBtnEle.classList.add("activeSendBtn");
        } else {
            sendBtnEle.classList.remove("activeSendBtn");
        }
    }
    textarea.style.height = "47px";
    textarea.style.height = textarea.scrollHeight + "px";
};
textarea.oninput = textInputEvent;
document.body.addEventListener("click", event => {
    if (event.target.className === "toggler") {
        document.body.classList.toggle("show-nav");
        if (window.innerWidth > 800) {
            localStorage.setItem("pinNav", document.body.classList.contains("show-nav"))
        }
    } else if (event.target.className === "overlay") {
        document.body.classList.remove("show-nav");
    } else if (event.target === document.body) {
        if (window.innerWidth <= 800) {
            document.body.classList.remove("show-nav");
        }
    }
});
let localPin = localStorage.getItem("pinNav");
if (localPin && localPin === "true" && window.innerWidth > 800) {
    document.body.classList.toggle("show-nav");
};
let themeMode = 1; // 2: 自动， 1: 浅色，0: 深色
let autoThemeMode = 1; // 1: 跟随系统，0:自定义时间
let customDarkTime = ["21:00", "07:00"]; // 开始，结束时间
let customDarkOut;
const setDarkTheme = (is) => {
    let cssEle = document.getElementsByTagName("link")[0];
    if (is) {document.documentElement.setAttribute("data-theme", "dark")}
    else {document.documentElement.removeAttribute("data-theme")}
    cssEle.href = cssEle.href.replace(is ? "light" : "dark", is ? "dark" : "light");
}
const handleAutoMode = (ele) => {
    if (ele.checked) {
        autoThemeMode = parseInt(ele.value);
        localStorage.setItem("autoThemeMode", autoThemeMode);
        initAutoTime();
        if (autoThemeMode) {
            if (customDarkOut !== void 0) {
                clearTimeout(customDarkOut);
                customDarkOut = void 0;
            }
            setDarkTheme(window.matchMedia("prefers-color-scheme: dark").matches);
        } else {
            checkCustomTheme();
        }
    }
}
const handleAutoTime = (ele, idx) => {
    let otherIdx = 1 - idx;
    if (ele.value !== customDarkTime[otherIdx]) {
        customDarkTime[idx] = ele.value;
        localStorage.setItem("customDarkTime", JSON.stringify(customDarkTime));
        checkCustomTheme();
    } else {
        ele.value = customDarkTime[idx];
        notyf.error("开始时间和结束时间不能相同！");
    }
}
const initAutoTime = () => {
    customAutoSet.style.display = autoThemeMode === 0 ? "block" : "none";
    if (autoThemeMode === 0) {
        customStart.value = customDarkTime[0];
        customEnd.value = customDarkTime[1];
    }
}
const initAutoThemeEle = () => {
    autoThemeEle.querySelector("#autoTheme" + autoThemeMode).checked = true;
    initAutoTime();
}
const checkCustomTheme = () => {
    if (customDarkOut !== void 0) clearTimeout(customDarkOut);
    let date = new Date();
    let nowTime = date.getTime();
    let start = customDarkTime[0].split(":");
    let startTime = new Date().setHours(start[0], start[1], 0, 0);
    let end = customDarkTime[1].split(":");
    let endTime = new Date().setHours(end[0], end[1], 0, 0);
    let order = endTime > startTime;
    let isDark = order ? (nowTime > startTime && endTime > nowTime) : !(nowTime > endTime && startTime > nowTime);
    let nextChange = isDark ? endTime - nowTime : startTime - nowTime;
    if (nextChange < 0) nextChange += 8.64e7;
    setDarkTheme(isDark);
    customDarkOut = setTimeout(() => {
        checkCustomTheme();
    }, nextChange);
}
const setDarkMode = () => {
    if (customDarkOut !== void 0) {
        clearTimeout(customDarkOut);
        customDarkOut = void 0;
    }
    autoThemeEle.style.display = "none";
    let themeClass, title;
    if (themeMode === 2) {
        autoThemeEle.style.display = "block";
        if (autoThemeMode) {
            setDarkTheme(window.matchMedia("prefers-color-scheme: dark").matches);
        } else {
            checkCustomTheme();
            initAutoThemeEle();
        }
        themeClass = "autoTheme";
        title = "自动";
    } else if (themeMode === 1) {
        setDarkTheme(false);
        themeClass = "lightTheme";
        title = "浅色";
    } else {
        setDarkTheme(true);
        themeClass = "darkTheme";
        title = "深色";
    }
    localStorage.setItem("themeMode", themeMode);
    setLightEle.className = "setDetail themeDetail " + themeClass;
    lightEle.children[0].children[0].setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + themeClass + "Icon");
    lightEle.title = title;
}
lightEle.onclick = () => {
    themeMode = themeMode - 1;
    if (themeMode === -1) themeMode = 2;
    setDarkMode();
}
setLightEle.onclick = (ev) => {
    let idx = Array.prototype.indexOf.call(setLightEle.children, ev.target);
    if (themeMode !== idx) {
        themeMode = idx;
        setDarkMode();
    }
}
let localTheme = localStorage.getItem("themeMode");
if (localTheme) themeMode = parseInt(localTheme);
let localAutoTheme = localStorage.getItem("autoThemeMode");
if (localAutoTheme) autoThemeMode = parseInt(localAutoTheme);
let localCustomDark = localStorage.getItem("customDarkTime");
if (localCustomDark) customDarkTime = JSON.parse(localCustomDark);
if (themeMode !== 1) setDarkMode();
window.matchMedia("(prefers-color-scheme: dark)").addListener(e => {
    if (themeMode === 2 && autoThemeMode) setDarkTheme(e.matches);
});
document.getElementById("toggleFull").onclick = function () {
    windowEle.classList.toggle("full_window");
    let isFull = windowEle.classList.contains("full_window");
    localStorage.setItem("fullWindow", isFull);
    this.title = isFull ? "窗口" : "全屏";
    this.children[0].children[0].setAttributeNS("http://www.w3.org/1999/xlink", "href", isFull ? "#collapseFullIcon" : "#expandFullIcon");
}
let localFull = localStorage.getItem("fullWindow");
if (localFull && localFull === "true") document.getElementById("toggleFull").dispatchEvent(new Event("click"));
const updateAvatar = () => {
    setAvatarPre.src = userAvatar;
    chatlog.querySelectorAll(".request>.chatAvatar").forEach(ele => {
        ele.children[0].src = userAvatar;
    })
}
let userAvatar = "http://mdmd.fun/chatgpt/avatar.jpg";
let localAvatar = localStorage.getItem("userAvatar");
if (localAvatar) userAvatar = localAvatar;
setAvatarPre.src = setAvatar.value = userAvatar;
setAvatar.onchange = () => {
    userAvatar = setAvatar.value;
    localStorage.setItem("userAvatar", userAvatar);
    updateAvatar()
}
const endSetEvent = (ev) => {
    if (!document.getElementById("sysContent").contains(ev.target)) {
        ev.preventDefault();
        ev.stopPropagation();
        endSet();
    }
}
const endSet = () => {
    document.getElementById("sysDialog").style.display = "none";
    document.body.removeEventListener("click", endSetEvent, true);
}
document.getElementById("closeSet").onclick = endSet;
document.getElementById("sysSetting").onclick = () => {
    document.getElementById("sysDialog").style.display = "flex";
    document.body.addEventListener("click", endSetEvent, true);
}
if (supportRec) {
    noRecTip.style.display = "none";
    yesRec.style.display = "block";
    document.getElementById("voiceRec").style.display = "block";
    textarea.classList.add("message_if_voice");
    let langs = [ // from https://www.google.com/intl/en/chrome/demos/speech.html
        ['中文', ['cmn-Hans-CN', '普通话 (大陆)'],
            ['cmn-Hans-HK', '普通话 (香港)'],
            ['cmn-Hant-TW', '中文 (台灣)'],
            ['yue-Hant-HK', '粵語 (香港)']],
        ['English', ['en-US', 'United States'],
            ['en-GB', 'United Kingdom'],
            ['en-AU', 'Australia'],
            ['en-CA', 'Canada'],
            ['en-IN', 'India'],
            ['en-KE', 'Kenya'],
            ['en-TZ', 'Tanzania'],
            ['en-GH', 'Ghana'],
            ['en-NZ', 'New Zealand'],
            ['en-NG', 'Nigeria'],
            ['en-ZA', 'South Africa'],
            ['en-PH', 'Philippines']]
    ];
    langs.forEach((lang, i) => {
        select_language.options.add(new Option(lang[0], i));
        selectLangOption.options.add(new Option(lang[0], i))
    });
    const updateCountry = function () {
        selectLangOption.selectedIndex = select_language.selectedIndex = this.selectedIndex;
        select_dialect.innerHTML = "";
        selectDiaOption.innerHTML = "";
        let list = langs[select_language.selectedIndex];
        for (let i = 1; i < list.length; i++) {
            select_dialect.options.add(new Option(list[i][1], list[i][0]));
            selectDiaOption.options.add(new Option(list[i][1], list[i][0]));
        }
        select_dialect.style.visibility = list[1].length == 1 ? "hidden" : "visible";
        selectDiaOption.parentElement.style.visibility = list[1].length == 1 ? "hidden" : "visible";
        localStorage.setItem("voiceRecLang", select_dialect.value);
    };
    let localLangIdx = 0;
    let localDiaIdx = 0;
    let localRecLang = localStorage.getItem("voiceRecLang");
    if (localRecLang) {
        let localIndex = langs.findIndex(item => {
            let diaIdx = item.findIndex(lang => {return lang instanceof Array && lang[0] === localRecLang});
            if (diaIdx !== -1) {
                localDiaIdx = diaIdx - 1;
                return true;
            }
            return false;
        });
        if (localIndex !== -1) localLangIdx = localIndex;
    }
    selectLangOption.onchange = updateCountry;
    select_language.onchange = updateCountry;
    selectDiaOption.onchange = select_dialect.onchange = function () {
        selectDiaOption.selectedIndex = select_dialect.selectedIndex = this.selectedIndex;
        localStorage.setItem("voiceRecLang", select_dialect.value);
    }
    selectLangOption.selectedIndex = select_language.selectedIndex = localLangIdx;
    select_language.dispatchEvent(new Event("change"));
    selectDiaOption.selectedIndex = select_dialect.selectedIndex = localDiaIdx;
    select_dialect.dispatchEvent(new Event("change"));
    let recIns = new webkitSpeechRecognition();
    // prevent some Android bug
    recIns.continuous = !(/\bAndroid\b/i.test(navigator.userAgent));
    recIns.interimResults = true;
    recIns.maxAlternatives = 1;
    let recRes = tempRes = "";
    let preRes, affRes;
    const resEvent = (event) => {
        if (typeof (event.results) === "undefined") {
            toggleRecEvent();
            return;
        }
        let isFinal;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            isFinal = event.results[i].isFinal;
            if (isFinal) {recRes += event.results[i][0].transcript}
            else {tempRes = recRes + event.results[i][0].transcript}
        }
        textarea.value = preRes + (isFinal ? recRes : tempRes) + affRes;
        textInputEvent();
        textarea.focus();
        textarea.selectionEnd = textarea.value.length - affRes.length;
    };
    const endEvent = (event) => {
        if (!(event && event.type === "end")) recIns.stop();
        recIns.onresult = null;
        recIns.onerror = null;
        recIns.onend = null;
        recRes = tempRes = "";
        voiceRecEle.classList.remove("voiceRecing");
        recing = false;
    };
    const errorEvent = (ev) => {
        if (event.error === "no-speech") {
            notyf.error("未识别到语音，请调整设备后重试！")
        }
        if (event.error === "audio-capture") {
            notyf.error("未找到麦克风，请确保已安装麦克风！")
        }
        if (event.error === "not-allowed") {
            notyf.error("未允许使用麦克风的权限！")
        }
        endEvent();
    }
    const closeEvent = (ev) => {
        if (voiceRecSetEle.contains(ev.target)) return;
        if (!voiceRecSetEle.contains(ev.target)) {
            voiceRecSetEle.style.display = "none";
            document.removeEventListener("mousedown", closeEvent, true);
            voiceRecEle.classList.remove("voiceLong");
        }
    }
    const longEvent = () => {
        voiceRecSetEle.style.display = "block";
        document.addEventListener("mousedown", closeEvent, true);
    }
    const toggleRecEvent = () => {
        voiceRecEle.classList.toggle("voiceRecing");
        if (voiceRecEle.classList.contains("voiceRecing")) {
            try {
                preRes = textarea.value.slice(0, textarea.selectionStart);
                affRes = textarea.value.slice(textarea.selectionEnd);
                recIns.lang = select_dialect.value;
                recIns.start();
                recIns.onresult = resEvent;
                recIns.onerror = errorEvent;
                recIns.onend = endEvent;
                recing = true;
            } catch (e) {
                endEvent();
            }
        } else {
            endEvent();
        }
    };
    toggleRecEv = toggleRecEvent;
    let timer;
    const voiceDownEvent = (ev) => {
        ev.preventDefault();
        let i = 0;
        voiceRecEle.classList.add("voiceLong");
        timer = setInterval(() => {
            i += 1;
            if (i >= 3) {
                clearInterval(timer);
                timer = void 0;
                longEvent();
            }
        }, 100)
    };
    const voiceUpEvent = (ev) => {
        ev.preventDefault();
        if (timer !== void 0) {
            toggleRecEvent();
            clearInterval(timer);
            timer = void 0;
            voiceRecEle.classList.remove("voiceLong");
        }
    }
    voiceRecEle.addEventListener("mousedown", voiceDownEvent);
    voiceRecEle.addEventListener("touchstart", voiceDownEvent);
    voiceRecEle.addEventListener("mouseup", voiceUpEvent);
    voiceRecEle.addEventListener("touchend", voiceUpEvent);
};
document.getElementsByClassName("setSwitch")[0].onclick = function (ev) {
    let activeEle = this.getElementsByClassName("activeSwitch")[0];
    if (ev.target !== activeEle) {
        activeEle.classList.remove("activeSwitch");
        ev.target.classList.add("activeSwitch");
        document.getElementById(ev.target.dataset.id).style.display = "block";
        document.getElementById(activeEle.dataset.id).style.display = "none";
    }
};
let localVoiceType = localStorage.getItem("existVoice");
if (localVoiceType) {
    existVoice = parseInt(localVoiceType);
    speechServiceEle.value = existVoice;
}
if (!(window.speechSynthesis && window.SpeechSynthesisUtterance)) {
    speechServiceEle.remove(2);
}
const clearAzureVoice = () => {
    azureKey = void 0;
    azureRegion = void 0;
    azureRole = [];
    azureStyle = [];
    document.getElementById("azureExtra").style.display = "none";
    azureKeyInput.parentElement.style.display = "none";
    preSetAzureRegion.parentElement.style.display = "none";
    if (azureTokenTimer) {
        clearInterval(azureTokenTimer);
        azureTokenTimer = void 0;
    }
}
speechServiceEle.onchange = () => {
    existVoice = parseInt(speechServiceEle.value);
    localStorage.setItem("existVoice", existVoice);
    toggleVoiceCheck(true);
    if (checkAzureAbort && !checkAzureAbort.signal.aborted) {
        checkAzureAbort.abort();
        checkAzureAbort = void 0;
    }
    if (checkEdgeAbort && !checkEdgeAbort.signal.aborted) {
        checkEdgeAbort.abort();
        checkEdgeAbort = void 0;
    }
    if (existVoice === 3) {
        azureKeyInput.parentElement.style.display = "block";
        preSetAzureRegion.parentElement.style.display = "block";
        loadAzureVoice();
    } else if (existVoice === 2) {
        clearAzureVoice();
        loadEdgeVoice();
    } else if (existVoice === 1) {
        toggleVoiceCheck(false);
        clearAzureVoice();
        loadLocalVoice();
    }
}
let azureVoiceData, edgeVoiceData, systemVoiceData, checkAzureAbort, checkEdgeAbort;
const toggleVoiceCheck = (bool) => {
    checkVoiceLoad.style.display = bool ? "flex" : "none";
    speechDetail.style.display = bool ? "none" : "block";
}
const loadAzureVoice = () => {
    let checking = false;
    checkVoiceLoad.onclick = () => {
        if (checking) return;
        if (azureKey) {
            checking = true;
            checkVoiceLoad.classList.add("voiceChecking");
            if (azureTokenTimer) {
                clearInterval(azureTokenTimer);
            }
            checkAzureAbort = new AbortController();
            setTimeout(() => {
                if (checkAzureAbort && !checkAzureAbort.signal.aborted) {
                    checkAzureAbort.abort();
                    checkAzureAbort = void 0;
                }
            }, 15000);
            Promise.all([getAzureToken(checkAzureAbort.signal), getVoiceList(checkAzureAbort.signal)]).then(() => {
                azureTokenTimer = setInterval(() => {
                    getAzureToken();
                }, 540000);
                toggleVoiceCheck(false);
            }).catch(e => {
            }).finally(() => {
                checkVoiceLoad.classList.remove("voiceChecking");
                checking = false;
            })
        }
    }
    const getAzureToken = (signal) => {
        return new Promise((res, rej) => {
            fetch("https://" + azureRegion + ".api.cognitive.microsoft.com/sts/v1.0/issueToken", {
                signal,
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": azureKey
                }
            }).then(response => {
                response.text().then(text => {
                    try {
                        let json = JSON.parse(text);
                        notyf.error("由于订阅密钥无效或 API 端点错误，访问被拒绝！");
                        rej();
                    } catch (e) {
                        azureToken = text;
                        res();
                    }
                });
            }).catch(e => {
                rej();
            })
        })
    };
    const getVoiceList = (signal) => {
        return new Promise((res, rej) => {
            if (azureVoiceData) {
                initVoiceSetting(azureVoiceData);
                res();
            } else {
                let localAzureVoiceData = localStorage.getItem(azureRegion + "voiceData");
                if (localAzureVoiceData) {
                    azureVoiceData = JSON.parse(localAzureVoiceData);
                    initVoiceSetting(azureVoiceData);
                    res();
                } else {
                    fetch("https://" + azureRegion + ".tts.speech.microsoft.com/cognitiveservices/voices/list", {
                        signal,
                        headers: {
                            "Ocp-Apim-Subscription-Key": azureKey
                        }
                    }).then(response => {
                        response.json().then(json => {
                            azureVoiceData = json;
                            localStorage.setItem(azureRegion + "voiceData", JSON.stringify(json));
                            initVoiceSetting(json);
                            res();
                        }).catch(e => {
                            notyf.error("由于订阅密钥无效或 API 端点错误，访问被拒绝！");
                            rej();
                        })
                    }).catch(e => {
                        rej();
                    })
                }
            }
        })
    };
    let azureRegionEle = document.getElementById("preSetAzureRegion");
    if (!azureRegionEle.options.length) {
        const azureRegions = ['southafricanorth', 'eastasia', 'southeastasia', 'australiaeast', 'centralindia', 'japaneast', 'japanwest', 'koreacentral', 'canadacentral', 'northeurope', 'westeurope', 'francecentral', 'germanywestcentral', 'norwayeast', 'switzerlandnorth', 'switzerlandwest', 'uksouth', 'uaenorth', 'brazilsouth', 'centralus', 'eastus', 'eastus2', 'northcentralus', 'southcentralus', 'westcentralus', 'westus', 'westus2', 'westus3'];
        azureRegions.forEach((region, i) => {
            let option = document.createElement("option");
            option.value = region;
            option.text = region;
            azureRegionEle.options.add(option);
        });
    }
    let localAzureRegion = localStorage.getItem("azureRegion");
    if (localAzureRegion) {
        azureRegion = localAzureRegion;
        azureRegionEle.value = localAzureRegion;
    }
    azureRegionEle.onchange = () => {
        azureRegion = azureRegionEle.value;
        localStorage.setItem("azureRegion", azureRegion);
        toggleVoiceCheck(true);
    }
    azureRegionEle.dispatchEvent(new Event("change"));
    let azureKeyEle = document.getElementById("azureKeyInput");
    let localAzureKey = localStorage.getItem("azureKey");
    if (localAzureKey) {
        azureKey = localAzureKey;
        azureKeyEle.value = localAzureKey;
    }
    azureKeyEle.onchange = () => {
        azureKey = azureKeyEle.value;
        localStorage.setItem("azureKey", azureKey);
        toggleVoiceCheck(true);
    }
    azureKeyEle.dispatchEvent(new Event("change"));
    if (azureKey) {
        checkVoiceLoad.dispatchEvent(new Event("click"))
    }
}
const loadEdgeVoice = () => {
    let checking = false;
    const endCheck = () => {
        checkVoiceLoad.classList.remove("voiceChecking");
        checking = false;
    };
    checkVoiceLoad.onclick = () => {
        if (checking) return;
        checking = true;
        checkVoiceLoad.classList.add("voiceChecking");
        if (edgeVoiceData) {
            initVoiceSetting(edgeVoiceData);
            toggleVoiceCheck(false);
            endCheck();
        } else {
            checkEdgeAbort = new AbortController();
            setTimeout(() => {
                if (checkEdgeAbort && !checkEdgeAbort.signal.aborted) {
                    checkEdgeAbort.abort();
                    checkEdgeAbort = void 0;
                }
            }, 10000);
            fetch("https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4", {signal: checkEdgeAbort.signal}).then(response => {
                response.json().then(json => {
                    edgeVoiceData = json;
                    toggleVoiceCheck(false);
                    initVoiceSetting(json);
                    endCheck();
                });
            }).catch(err => {
                endCheck();
            })
        }
    };
    checkVoiceLoad.dispatchEvent(new Event("click"));
};
const loadLocalVoice = () => {
    if (systemVoiceData) {
        initVoiceSetting(systemVoiceData);
    } else {
        let initedVoice = false;
        const getLocalVoice = () => {
            let voices = speechSynthesis.getVoices();
            if (voices.length) {
                if (!initedVoice) {
                    initedVoice = true;
                    systemVoiceData = voices;
                    initVoiceSetting(voices);
                }
                return true;
            } else {
                return false;
            }
        }
        let syncExist = getLocalVoice();
        if (!syncExist) {
            if ("onvoiceschanged" in speechSynthesis) {
                speechSynthesis.onvoiceschanged = () => {
                    getLocalVoice();
                }
            } else if (speechSynthesis.addEventListener) {
                speechSynthesis.addEventListener("voiceschanged", () => {
                    getLocalVoice();
                })
            }
            let timeout = 0;
            let timer = setInterval(() => {
                if (getLocalVoice() || timeout > 1000) {
                    if (timeout > 1000) {
                        existVoice = 0;
                    }
                    clearInterval(timer);
                    timer = null;
                }
                timeout += 300;
            }, 300)
        }
    }
};
const initVoiceSetting = (voices) => {
    let isOnline = existVoice >= 2;
    let voicesEle = document.getElementById("preSetSpeech");
    // 支持中文和英文
    voices = isOnline ? voices.filter(item => item.Locale.match(/^(zh-|en-)/)) : voices.filter(item => item.lang.match(/^(zh-|en-)/));
    if (isOnline) {
        voices.map(item => {
            item.name = item.FriendlyName || (`${item.DisplayName} Online (${item.VoiceType}) - ${item.LocaleName}`);
            item.lang = item.Locale;
        })
    }
    voices.sort((a, b) => {
        if (a.lang.slice(0, 2) === b.lang.slice(0, 2)) return 0;
        return (a.lang < b.lang) ? 1 : -1; // 中文在前"z"
    });
    voices.map(item => {
        if (item.name.match(/^(Google |Microsoft )/)) {
            item.displayName = item.name.replace(/^.*? /, "");
        } else {
            item.displayName = item.name;
        }
    });
    voicesEle.innerHTML = "";
    voices.forEach((voice, i) => {
        let option = document.createElement("option");
        option.value = i;
        option.text = voice.displayName;
        voicesEle.options.add(option);
    });
    voicesEle.onchange = () => {
        voiceRole[voiceType] = voices[voicesEle.value];
        localStorage.setItem("voice" + voiceType, voiceRole[voiceType].name);
        if (voiceRole[voiceType].StyleList || voiceRole[voiceType].RolePlayList) {
            document.getElementById("azureExtra").style.display = "block";
            let voiceStyles = voiceRole[voiceType].StyleList;
            let voiceRoles = voiceRole[voiceType].RolePlayList;
            if (voiceRoles) {
                preSetVoiceRole.innerHTML = "";
                voiceRoles.forEach((role, i) => {
                    let option = document.createElement("option");
                    option.value = role;
                    option.text = role;
                    preSetVoiceRole.options.add(option);
                });
                let localRole = localStorage.getItem("azureRole" + voiceType);
                if (localRole && voiceRoles.indexOf(localRole) !== -1) {
                    preSetVoiceRole.value = localRole;
                    azureRole[voiceType] = localRole;
                } else {
                    preSetVoiceRole.selectedIndex = 0;
                    azureRole[voiceType] = voiceRole[0];
                }
                preSetVoiceRole.onchange = () => {
                    azureRole[voiceType] = preSetVoiceRole.value;
                    localStorage.setItem("azureRole" + voiceType, preSetVoiceRole.value);
                }
                preSetVoiceRole.dispatchEvent(new Event("change"));
            } else {
                azureRole[voiceType] = void 0;
                localStorage.removeItem("azureRole" + voiceType);
            }
            preSetVoiceRole.style.display = voiceRoles ? "block" : "none";
            preSetVoiceRole.previousElementSibling.style.display = voiceRoles ? "block" : "none";
            if (voiceStyles) {
                preSetVoiceStyle.innerHTML = "";
                voiceStyles.forEach((style, i) => {
                    let option = document.createElement("option");
                    option.value = style;
                    option.text = style;
                    preSetVoiceStyle.options.add(option);
                });
                let localStyle = localStorage.getItem("azureStyle" + voiceType);
                if (localStyle && voiceStyles.indexOf(localStyle) !== -1) {
                    preSetVoiceStyle.value = localStyle;
                    azureStyle[voiceType] = localStyle;
                } else {
                    preSetVoiceStyle.selectedIndex = 0;
                    azureStyle[voiceType] = voiceStyles[0];
                }
                preSetVoiceStyle.onchange = () => {
                    azureStyle[voiceType] = preSetVoiceStyle.value;
                    localStorage.setItem("azureStyle" + voiceType, preSetVoiceStyle.value)
                }
                preSetVoiceStyle.dispatchEvent(new Event("change"));
            } else {
                azureStyle[voiceType] = void 0;
                localStorage.removeItem("azureStyle" + voiceType);
            }
            preSetVoiceStyle.style.display = voiceStyles ? "block" : "none";
            preSetVoiceStyle.previousElementSibling.style.display = voiceStyles ? "block" : "none";
        } else {
            document.getElementById("azureExtra").style.display = "none";
            azureRole[voiceType] = void 0;
            localStorage.removeItem("azureRole" + voiceType);
            azureStyle[voiceType] = void 0;
            localStorage.removeItem("azureStyle" + voiceType);
        }
    };
    const loadAnother = (type) => {
        type = type ^ 1;
        let localVoice = localStorage.getItem("voice" + type);
        if (localVoice) {
            let localIndex = voices.findIndex(item => {return item.name === localVoice});
            if (localIndex === -1) localIndex = 0;
            voiceRole[type] = voices[localIndex];
        } else {
            voiceRole[type] = voices[0];
        }
        if (existVoice === 3) {
            let localStyle = localStorage.getItem("azureStyle" + type);
            azureStyle[type] = localStyle ? localStyle : void 0;
            let localRole = localStorage.getItem("azureRole" + type);
            azureRole[type] = localRole ? localRole : void 0;
        }
    }
    const voiceChange = () => {
        let localVoice = localStorage.getItem("voice" + voiceType);
        if (localVoice) {
            let localIndex = voices.findIndex(item => {return item.name === localVoice});
            if (localIndex === -1) localIndex = 0;
            voiceRole[voiceType] = voices[localIndex];
            voicesEle.value = localIndex;
        }
        voicesEle.dispatchEvent(new Event("change"));
    }
    voiceChange();
    loadAnother(voiceType);
    let volumeEle = document.getElementById("voiceVolume");
    let localVolume = localStorage.getItem("voiceVolume0");
    voiceVolume[0] = parseFloat(localVolume ? localVolume : volumeEle.value);
    const voiceVolumeChange = () => {
        let localVolume = localStorage.getItem("voiceVolume" + voiceType);
        if (localVolume) {
            voiceVolume[voiceType] = parseFloat(localVolume);
            volumeEle.value = localVolume;
            volumeEle.style.backgroundSize = (volumeEle.value - volumeEle.min) * 100 / (volumeEle.max - volumeEle.min) + "% 100%";
        } else {
            volumeEle.dispatchEvent(new Event("input"));
        }
    }
    volumeEle.oninput = () => {
        volumeEle.style.backgroundSize = (volumeEle.value - volumeEle.min) * 100 / (volumeEle.max - volumeEle.min) + "% 100%";
        voiceVolume[voiceType] = parseFloat(volumeEle.value);
        localStorage.setItem("voiceVolume" + voiceType, volumeEle.value);
    }
    voiceVolumeChange();
    let rateEle = document.getElementById("voiceRate");
    let localRate = localStorage.getItem("voiceRate0");
    voiceRate[0] = parseFloat(localRate ? localRate : rateEle.value);
    const voiceRateChange = () => {
        let localRate = localStorage.getItem("voiceRate" + voiceType);
        if (localRate) {
            voiceRate[voiceType] = parseFloat(localRate);
            rateEle.value = localRate;
            rateEle.style.backgroundSize = (rateEle.value - rateEle.min) * 100 / (rateEle.max - rateEle.min) + "% 100%";
        } else {
            rateEle.dispatchEvent(new Event("input"));
        }
    }
    rateEle.oninput = () => {
        rateEle.style.backgroundSize = (rateEle.value - rateEle.min) * 100 / (rateEle.max - rateEle.min) + "% 100%";
        voiceRate[voiceType] = parseFloat(rateEle.value);
        localStorage.setItem("voiceRate" + voiceType, rateEle.value);
    }
    voiceRateChange();
    let pitchEle = document.getElementById("voicePitch");
    let localPitch = localStorage.getItem("voicePitch0");
    voicePitch[0] = parseFloat(localPitch ? localPitch : pitchEle.value);
    const voicePitchChange = () => {
        let localPitch = localStorage.getItem("voicePitch" + voiceType);
        if (localPitch) {
            voicePitch[voiceType] = parseFloat(localPitch);
            pitchEle.value = localPitch;
            pitchEle.style.backgroundSize = (pitchEle.value - pitchEle.min) * 100 / (pitchEle.max - pitchEle.min) + "% 100%";
        } else {
            pitchEle.dispatchEvent(new Event("input"));
        }
    }
    pitchEle.oninput = () => {
        pitchEle.style.backgroundSize = (pitchEle.value - pitchEle.min) * 100 / (pitchEle.max - pitchEle.min) + "% 100%";
        voicePitch[voiceType] = parseFloat(pitchEle.value);
        localStorage.setItem("voicePitch" + voiceType, pitchEle.value);
    }
    voicePitchChange();
    document.getElementById("voiceTypes").onclick = (ev) => {
        let type = ev.target.dataset.type;
        if (type !== void 0) {
            type = parseInt(type);
            if (type != voiceType) {
                voiceType = type;
                ev.target.classList.add("selVoiceType");
                ev.target.parentElement.children[type ^ 1].classList.remove("selVoiceType");
                voiceChange();
                voiceVolumeChange();
                voiceRateChange();
                voicePitchChange();
            }
        };
    };
    const contVoiceEle = document.getElementById("enableContVoice");
    let localCont = localStorage.getItem("enableContVoice");
    if (localCont) {
        enableContVoice = localCont === "true";
        contVoiceEle.checked = enableContVoice;
    }
    contVoiceEle.onchange = () => {
        enableContVoice = contVoiceEle.checked;
        localStorage.setItem("enableContVoice", enableContVoice);
    }
    contVoiceEle.dispatchEvent(new Event("change"));
    const autoVoiceEle = document.getElementById("enableAutoVoice");
    let localAuto = localStorage.getItem("enableAutoVoice");
    if (localAuto) {
        enableAutoVoice = localAuto === "true";
        autoVoiceEle.checked = enableAutoVoice;
    }
    autoVoiceEle.onchange = () => {
        enableAutoVoice = autoVoiceEle.checked;
        localStorage.setItem("enableAutoVoice", enableAutoVoice);
    }
    autoVoiceEle.dispatchEvent(new Event("change"));
};
speechServiceEle.dispatchEvent(new Event("change"));


// const API_URL = "v1/chat/completions";
let loading = false;
let presetRoleData = {
    "normal": "你是一个乐于助人的助手，尽量简明扼要地回答",
    "cat": "你是一个可爱的猫娘，每句话结尾都要带个'喵'",
    "emoji": "你的性格很活泼，每句话中都要有至少一个emoji图标",
    "image": "当你需要发送图片的时候，请用 markdown 语言生成，不要反斜线，不要代码框，需要使用 unsplash API时，遵循一下格式， https://source.unsplash.com/960x640/? ＜英文关键词＞"
};
let modelVersion; // 模型版本
let apiHost; // api反代地址
let customAPIKey; // 自定义apiKey
let systemRole; // 自定义系统角色
let roleNature; // 角色性格
let roleTemp; // 回答质量
let enableCont; // 是否开启连续对话，默认开启，对话包含上下文信息。
let enableLongReply; // 是否开启长回复，默认关闭，开启可能导致api费用增加。
let longReplyFlag;
let textSpeed; // 打字机速度，越小越快
let voiceIns; // Audio or SpeechSynthesisUtterance
const supportMSE = !!window.MediaSource; // 是否支持MSE（除了ios应该都支持）
let voiceMIME = "audio/mpeg";
const scrollToBottom = () => {
    if (messagsEle.scrollHeight - messagsEle.scrollTop - messagsEle.clientHeight < 128) {
        messagsEle.scrollTo(0, messagsEle.scrollHeight)
    }
}
const scrollToBottomLoad = (ele) => {
    if (messagsEle.scrollHeight - messagsEle.scrollTop - messagsEle.clientHeight < ele.clientHeight + 128) {
        messagsEle.scrollTo(0, messagsEle.scrollHeight)
    }
}
const escapeTextarea = document.createElement("textarea");
const getEscape = (str) => {
    escapeTextarea.textContent = str;
    return escapeTextarea.innerHTML;
}
const getUnescape = (html) => {
    escapeTextarea.innerHTML = html;
    return escapeTextarea.textContent;
}
const md = markdownit({
    linkify: true, // 识别链接
    highlight: function (str, lang) { // markdown高亮
        try {
            return hljs.highlightAuto(str).value;
        } catch (e) { }
        return ""; // use external default escaping
    }
});
md.use(texmath, {engine: katex, delimiters: "dollars", katexOptions: {macros: {"\\RR": "\\mathbb{R}"}}})
    .use(markdownitLinkAttributes, {attrs: {target: "_blank", rel: "noopener"}});
const x = {
    getCodeLang(str = "") {
        const res = str.match(/ class="language-(.*?)"/);
        return (res && res[1]) || "";
    },
    getFragment(str = "") {
        return str ? `<span class="u-mdic-copy-code_lang">${str}</span>` : "";
    },
};
const getCodeLangFragment = (oriStr = "") => {
    return x.getFragment(x.getCodeLang(oriStr));
};
const copyClickCode = (ele) => {
    const input = document.createElement("textarea");
    input.value = ele.parentElement.previousElementSibling.textContent;
    const nDom = ele.previousElementSibling;
    const nDelay = ele.dataset.mdicNotifyDelay;
    const cDom = nDom.previousElementSibling;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("copy");
    document.body.removeChild(input);
    if (nDom.style.display === "none") {
        nDom.style.display = "block";
        cDom && (cDom.style.display = "none");
        setTimeout(() => {
            nDom.style.display = "none";
            cDom && (cDom.style.display = "block");
        }, nDelay);
    }
};
const copyClickMd = (idx) => {
    const input = document.createElement("textarea");
    input.value = data[idx].content;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("copy");
    document.body.removeChild(input);
}
const enhanceCode = (render, options = {}) => (...args) => {
    /* args = [tokens, idx, options, env, slf] */
    const {
        btnText = "复制代码", // button text
        successText = "复制成功", // copy-success text
        successTextDelay = 2000, // successText show time [ms]
        showCodeLanguage = true, // false | show code language
    } = options;
    const [tokens = {}, idx = 0] = args;
    const originResult = render.apply(this, args);
    const langFrag = showCodeLanguage ? getCodeLangFragment(originResult) : "";
    const tpls = [
        '<div class="m-mdic-copy-wrapper">',
        `${langFrag}`,
        `<div class="u-mdic-copy-notify" style="display:none;">${successText}</div>`,
        '<button ',
        'class="u-mdic-copy-btn j-mdic-copy-btn" ',
        `data-mdic-notify-delay="${successTextDelay}" `,
        `onclick="copyClickCode(this)">${btnText}</button>`,
        '</div>',
    ];
    return originResult.replace("</pre>", `${tpls.join("")}</pre>`);
};
md.renderer.rules.code_block = enhanceCode(md.renderer.rules.code_block);
md.renderer.rules.fence = enhanceCode(md.renderer.rules.fence);
md.renderer.rules.image = function (tokens, idx, options, env, slf) {
    let token = tokens[idx];
    token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
    token.attrSet("onload", "scrollToBottomLoad(this);this.removeAttribute('onload');this.removeAttribute('onerror')");
    token.attrSet("onerror", "scrollToBottomLoad(this);this.removeAttribute('onload');this.removeAttribute('onerror')");
    return slf.renderToken(tokens, idx, options)
}
let editingIdx;
let originText;
const resumeSend = () => {
    if (editingIdx !== void 0) {
        chatlog.children[systemRole ? editingIdx - 1 : editingIdx].classList.remove("showEditReq");
    }
    sendBtnEle.children[0].textContent = "发送";
    textarea.value = originText;
    clearEle.title = "清空会话";
    clearEle.classList.remove("closeConv");
    originText = void 0;
    editingIdx = void 0;
}
const mdOptionEvent = function (ev) {
    let id = ev.target.dataset.id;
    if (id) {
        let parent = ev.target.parentElement;
        let idxEle = parent.parentElement;
        let idx = Array.prototype.indexOf.call(chatlog.children, this.parentElement);
        if (id === "voiceMd") {
            let classList = ev.target.classList;
            if (classList.contains("readyVoice")) {
                if (chatlog.children[idx].dataset.loading !== "true") {
                    idx = systemRole ? idx + 1 : idx;
                    speechEvent(idx);
                }
            } else if (classList.contains("pauseVoice")) {
                if (existVoice >= 2) {
                    if (voiceIns) voiceIns.pause();
                } else {
                    speechSynthesis.pause();
                    classList.remove("readyVoice");
                    classList.remove("pauseVoice");
                    classList.add("resumeVoice");
                }
            } else {
                if (existVoice >= 2) {
                    if (voiceIns) voiceIns.play();
                } else {
                    speechSynthesis.resume();
                    classList.remove("readyVoice");
                    classList.remove("resumeVoice");
                    classList.add("pauseVoice");
                }
            }
        } else if (id === "editMd") {
            let reqEle = chatlog.children[idx];
            idx = systemRole ? idx + 1 : idx;
            if (editingIdx === idx) return;
            if (editingIdx !== void 0) {
                chatListEle.children[systemRole ? editingIdx - 1 : editingIdx].classList.remove("showEditReq");
            }
            reqEle.classList.add("showEditReq");
            editingIdx = idx;
            originText = textarea.value;
            textarea.value = data[idx].content;
            textarea.dispatchEvent(new Event("input"));
            textarea.focus();
            sendBtnEle.children[0].textContent = "更新";
            clearEle.title = "取消";
            clearEle.classList.add("closeConv");
        } else if (id === "refreshMd") {
            if (noLoading()) {
                if (ev.target.classList.contains("refreshReq")) {
                    chatlog.children[idx].children[1].innerHTML = "<br />";
                    chatlog.children[idx].dataset.loading = true;
                    idx = systemRole ? idx + 1 : idx;
                    data[idx].content = "";
                    if (idx === currentVoiceIdx) {endSpeak()};
                    loadAction(true);
                    refreshIdx = idx;
                    streamGen();
                } else {
                    chatlog.children[idx].dataset.loading = true;
                    idx = systemRole ? idx + 1 : idx;
                    progressData = data[idx].content;
                    loadAction(true);
                    refreshIdx = idx;
                    streamGen(true);
                }
            }
        } else if (id === "copyMd") {
            idx = systemRole ? idx + 1 : idx;
            copyClickMd(idx);
            notyf.success("复制成功");
        } else if (id === "delMd") {
            if (noLoading()) {
                if (confirmAction("是否删除此消息?")) {
                    chatlog.removeChild(chatlog.children[idx]);
                    idx = systemRole ? idx + 1 : idx;
                    if (currentVoiceIdx !== void 0) {
                        if (currentVoiceIdx === idx) {endSpeak()}
                        else if (currentVoiceIdx > idx) {currentVoiceIdx--}
                    }
                    if (editingIdx !== void 0) {
                        if (editingIdx === idx) {resumeSend()}
                        else if (editingIdx > idx) {editingIdx--}
                    }
                    data.splice(idx, 1);
                    updateChats();
                }
            }
        } else if (id === "downAudio") {
            if (chatlog.children[idx].dataset.loading !== "true") {
                idx = systemRole ? idx + 1 : idx;
                downloadAudio(idx);
            }
        }
    }
}
const formatMdEle = (ele) => {
    let avatar = document.createElement("div");
    avatar.className = "chatAvatar";
    avatar.innerHTML = ele.className === "request" ? `<img src="${userAvatar}" />` : `<svg width="22" height="22"><use xlink:href="#aiIcon"></use></svg>`;
    ele.appendChild(avatar);
    let realMd = document.createElement("div");
    realMd.className = ele.className === "request" ? "requestBody" : "markdown-body";
    ele.appendChild(realMd);
    let mdOption = document.createElement("div");
    mdOption.className = "mdOption";
    ele.appendChild(mdOption);
    let optionWidth = existVoice >= 2 ? 140 : 105;
    mdOption.innerHTML += `<div class="optionItems" style="width:${optionWidth}px;left:-${optionWidth - 10}px">`
        + (ele.className === "request" ? `<div data-id="editMd" class="optionItem" title="编辑">
        <svg width="18" height="18"><use xlink:href="#chatEditIcon" /></svg>
        </div>` : `<div data-id="refreshMd" class="refreshReq optionItem" title="刷新">
        <svg width="16" height="16" ><use xlink:href="#refreshIcon" /></svg>
        <svg width="16" height="16" ><use xlink:href="#halfRefIcon" /></svg>
        </div>`) +
        `<div data-id="copyMd" class="optionItem" title="复制">
        <svg width="20" height="20"><use xlink:href="#copyIcon" /></svg>
    </div>
    <div data-id="delMd" class="optionItem" title="删除">
        <svg width="20" height="20"><use xlink:href="#delIcon" /></svg>
    </div>` + (existVoice >= 2 ? `<div data-id="downAudio" class="optionItem" title="下载语音">
        <svg width="20" height="20"><use xlink:href="#downAudioIcon" /></svg>
    </div>` : "") + `</div>`;
    if (existVoice) {
        mdOption.innerHTML += `<div class="voiceCls readyVoice" data-id="voiceMd">
        <svg width="21" height="21" role="img"><title>朗读</title><use xlink:href="#readyVoiceIcon" /></svg>
        <svg width="21" height="21" role="img"><title>暂停</title><use xlink:href="#pauseVoiceIcon" /></svg>
        <svg width="21" height="21" role="img"><title>继续</title><use xlink:href="#resumeVoiceIcon" /></svg>
        </div>`
    }
    mdOption.onclick = mdOptionEvent;
}
let allEle = chatListEle.parentElement;
let folderData = [];
let chatsData = [];
let chatIdxs = [];
let activeChatIdx = 0;
let activeChatEle;
let operateChatIdx, operateFolderIdx;
let dragLi, dragType, dragIdx;
const delDragIdx = () => {
    let chatIdx = chatIdxs.indexOf(dragIdx);
    if (chatIdx !== -1) {
        chatIdxs.splice(chatIdx, 1);
    } else {
        folderData.forEach((item, i) => {
            let inIdx = item.idxs.indexOf(dragIdx);
            if (inIdx !== -1) {
                item.idxs.splice(inIdx, 1);
                updateFolder(i);
            }
        })
    }
}
const updateFolder = (idx) => {
    let folderEle = folderListEle.children[idx];
    let childLen = folderData[idx].idxs.length;
    folderEle.children[0].children[1].children[1].textContent = childLen + "个会话";
    if (childLen) {folderEle.classList.add("expandFolder")}
    else {folderEle.classList.remove("expandFolder")}
}
folderListEle.ondragenter = chatListEle.ondragenter = function (ev) {
    ev.preventDefault();
    if (ev.target === dragLi) return;
    allEle.querySelectorAll(".dragingChat").forEach(ele => {
        ele.classList.remove("dragingChat");
    })
    if (dragType === "chat") {
        if (this === chatListEle) {
            this.classList.add("dragingChat");
            let dragindex = Array.prototype.indexOf.call(chatListEle.children, dragLi);
            let targetindex = Array.prototype.indexOf.call(chatListEle.children, ev.target);
            delDragIdx();
            if (targetindex !== -1) {
                chatIdxs.splice(targetindex, 0, dragIdx);
                if (dragindex === -1 || dragindex >= targetindex) {
                    chatListEle.insertBefore(dragLi, ev.target);
                } else {
                    chatListEle.insertBefore(dragLi, ev.target.nextElementSibling);
                }
            } else {
                chatIdxs.push(dragIdx);
                chatListEle.appendChild(dragLi);
            }
        } else if (this === folderListEle) {
            let folderIdx;
            if (ev.target.classList.contains("headLi")) {
                ev.target.parentElement.classList.add("dragingChat");
                ev.target.nextElementSibling.appendChild(dragLi);
                delDragIdx();
                folderIdx = Array.prototype.indexOf.call(folderListEle.children, ev.target.parentElement);
                folderData[folderIdx].idxs.push(dragIdx);
                updateFolder(folderIdx);
            } else if (ev.target.classList.contains("chatLi")) {
                ev.target.parentElement.parentElement.classList.add("dragingChat");
                let parent = ev.target.parentElement;
                delDragIdx();
                folderIdx = Array.prototype.indexOf.call(folderListEle.children, parent.parentElement);
                let dragindex = Array.prototype.indexOf.call(parent.children, dragLi);
                let targetindex = Array.prototype.indexOf.call(parent.children, ev.target);
                if (dragindex !== -1) {
                    folderData[folderIdx].idxs.splice(targetindex, 0, dragIdx);
                    if (dragindex < targetindex) {
                        parent.insertBefore(dragLi, ev.target.nextElementSibling);
                    } else {
                        parent.insertBefore(dragLi, ev.target);
                    }
                } else {
                    folderData[folderIdx].idxs.push(dragIdx);
                    parent.appendChild(dragLi);
                }
                updateFolder(folderIdx);
            }
        }
        updateChatIdxs();
    } else if (dragType === "folder") {
        if (this === folderListEle) {
            let dragindex = Array.prototype.indexOf.call(folderListEle.children, dragLi);
            let folderIdx = Array.prototype.findIndex.call(folderListEle.children, (item) => {
                return item.contains(ev.target);
            })
            folderListEle.children[folderIdx].classList.remove("expandFolder");
            let folderEle = folderListEle.children[folderIdx];
            let data = folderData.splice(dragindex, 1)[0];
            folderData.splice(folderIdx, 0, data);
            if (dragindex === -1 || dragindex >= folderIdx) {
                folderListEle.insertBefore(dragLi, folderEle);
            } else {
                folderListEle.insertBefore(dragLi, folderEle.nextElementSibling);
            }
            updateChatIdxs();
        }
    }
}
folderListEle.ondragover = chatListEle.ondragover = (ev) => {
    ev.preventDefault();
}
folderListEle.ondragend = chatListEle.ondragend = (ev) => {
    document.getElementsByClassName("dragingLi")[0].classList.remove("dragingLi");
    allEle.querySelectorAll(".dragingChat").forEach(ele => {
        ele.classList.remove("dragingChat");
    })
    dragType = dragIdx = dragLi = void 0;
}
const chatDragStartEv = function (ev) {
    ev.stopPropagation();
    dragLi = this;
    dragLi.classList.add("dragingLi");
    dragType = "chat";
    if (chatListEle.contains(this)) {
        let idx = Array.prototype.indexOf.call(chatListEle.children, this);
        dragIdx = chatIdxs[idx];
    } else if (folderListEle.contains(this)) {
        let folderIdx = Array.prototype.indexOf.call(folderListEle.children, this.parentElement.parentElement);
        let inFolderIdx = Array.prototype.indexOf.call(this.parentElement.children, this);
        dragIdx = folderData[folderIdx].idxs[inFolderIdx];
    }
}
const extraFolderActive = (folderIdx) => {
    let folderNewIdx = -1;
    for (let i = folderIdx - 1; i >= 0; i--) {
        if (folderData[i].idxs.length) {
            folderNewIdx = i;
        }
    }
    if (folderNewIdx === -1) {
        for (let i = folderIdx + 1; i < folderData.length; i++) {
            if (folderData[i].idxs.length) {
                folderNewIdx = i;
            }
        }
    }
    if (folderNewIdx !== -1) {
        activeChatIdx = folderData[folderNewIdx].idxs[0];
    } else if (chatIdxs.length) {
        activeChatIdx = chatIdxs[0];
    } else {
        activeChatIdx = -1;
    }
}
const delFolder = (folderIdx, ele) => {
    if (confirmAction("是否删除文件夹?")) {
        let delData = folderData[folderIdx];
        let idxs = delData.idxs.sort();
        ele.parentElement.remove();
        if (idxs.indexOf(activeChatIdx) !== -1) {
            endAll();
            extraFolderActive(folderIdx);
        }
        folderData.splice(folderIdx, 1);
        for (let i = idxs.length - 1; i >= 0; i--) {
            chatsData.splice(idxs[i], 1);
        }
        folderData.forEach(item => {
            if (item.idxs.length) {
                item.idxs.forEach((i, ix) => {
                    let len = idxs.filter(j => {return i > j}).length;
                    if (len) {
                        item.idxs[ix] = i - len;
                    }
                })
            }
        })
        chatIdxs.forEach((item, ix) => {
            let len = idxs.filter(j => {return item > j}).length;
            if (len) chatIdxs[ix] = item - len;
        })
        let len = idxs.filter(j => {return activeChatIdx > j}).length;
        if (len) activeChatIdx -= len;
        updateChats();
        activeChat();
    }
}
const folderEleEvent = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let parent = this.parentElement;
    let idx = Array.prototype.indexOf.call(folderListEle.children, parent);
    if (ev.target.className === "headLi") {
        parent.classList.toggle("expandFolder");
        if (folderData[idx].idxs.indexOf(activeChatIdx) !== -1) {
            if (parent.classList.contains("expandFolder")) {
                parent.classList.remove("activeFolder");
            } else {
                parent.classList.add("activeFolder");
            }
        }
    } else if (ev.target.dataset.type === "folderEdit") {
        toEditName(idx, this, 0);
    } else if (ev.target.dataset.type === "folderDel") {
        delFolder(idx, this);
    }
}
const folderDragStartEv = function (ev) {
    dragLi = this;
    dragLi.classList.add("dragingLi");
    dragType = "folder";
    dragIdx = Array.prototype.indexOf.call(folderListEle.children, this);
}
const folderEleAdd = (idx, push = true) => {
    let folder = folderData[idx];
    let folderEle = document.createElement("div");
    folderEle.className = "folderLi";
    folderEle.setAttribute("draggable", "true");
    let headEle = document.createElement("div");
    headEle.className = "headLi";
    headEle.innerHTML = `<svg width="24" height="24"><use xlink:href="#expandFolderIcon" /></svg>
        <div class="folderInfo">
            <div class="folderName"></div>
            <div class="folderNum"></div>
        </div>
        <div class="folderOption"><svg data-type="folderEdit" style="margin-right:2px" width="24" height="24" role="img"><title>编辑</title><use xlink:href="#chatEditIcon" /></svg>
        <svg data-type="folderDel" width="24" height="24" role="img"><title>删除</title><use xlink:href="#delIcon" /></svg></div>`
    headEle.children[1].children[0].textContent = folder.name;
    headEle.children[1].children[1].textContent = folder.idxs.length + "个会话";
    folderEle.appendChild(headEle);
    folderEle.ondragstart = folderDragStartEv;
    headEle.onclick = folderEleEvent;
    let chatsEle = document.createElement("div");
    chatsEle.className = "chatsInFolder";
    for (let i = 0; i < folder.idxs.length; i++) {
        chatsEle.appendChild(chatEleAdd(folder.idxs[i], false));
    }
    folderEle.appendChild(chatsEle);
    if (push) {folderListEle.appendChild(folderEle)}
    else {folderListEle.insertBefore(folderEle, folderListEle.firstChild)}
}
document.getElementById("newFolder").onclick = function () {
    folderData.unshift({name: "新文件夹", idxs: []});
    folderEleAdd(0, false);
    updateChatIdxs();
    folderListEle.parentElement.scrollTop = 0;
};
const initChatEle = (index, chatEle) => {
    chatEle.children[1].children[0].textContent = chatsData[index].name;
    let chatPreview = "";
    if (chatsData[index].data && chatsData[index].data.length) {
        let first = chatsData[index].data.find(item => {return item.role === "assistant"});
        if (first) {chatPreview = first.content.slice(0, 30)}
    }
    chatEle.children[1].children[1].textContent = chatPreview;
}
const chatEleAdd = (idx, appendChat = true) => {
    let chat = chatsData[idx];
    let chatEle = document.createElement("div");
    chatEle.className = "chatLi";
    chatEle.setAttribute("draggable", "true");
    chatEle.ondragstart = chatDragStartEv;
    chatEle.innerHTML = `<svg width="24" height="24"><use xlink:href="#chatIcon" /></svg>
        <div class="chatInfo">
            <div class="chatName"></div>
            <div class="chatPre"></div>
        </div>
        <div class="chatOption"><svg data-type="chatEdit" style="margin-right:2px" width="24" height="24" role="img"><title>编辑</title><use xlink:href="#chatEditIcon" /></svg>
        <svg data-type="chatDel" width="24" height="24" role="img"><title>删除</title><use xlink:href="#delIcon" /></svg></div>`
    if (appendChat) chatListEle.appendChild(chatEle);
    initChatEle(idx, chatEle);
    chatEle.onclick = chatEleEvent;
    return chatEle;
};
const addNewChat = () => {
    let chat = {name: "新的会话", data: []};
    chatsData.push(chat);
    chatIdxs.push(chatsData.length - 1);
    updateChats();
};
const delChat = (idx, ele, folderIdx, inFolderIdx) => {
    if (confirmAction("是否删除会话?")) {
        endAll();
        if (folderIdx !== void 0) {
            let folder = folderData[folderIdx];
            folder.idxs.splice(inFolderIdx, 1);
            updateFolder(folderIdx);
            if (idx === activeChatIdx) {
                if (inFolderIdx - 1 >= 0) {
                    activeChatIdx = folder.idxs[inFolderIdx - 1];
                } else if (folder.idxs.length) {
                    activeChatIdx = folder.idxs[0];
                } else {
                    extraFolderActive(folderIdx);
                }
            }
        } else {
            let chatIdx = chatIdxs.indexOf(idx);
            chatIdxs.splice(chatIdx, 1);
            if (idx === activeChatIdx) {
                if (chatIdx - 1 >= 0) {
                    activeChatIdx = chatIdxs[chatIdx - 1];
                } else if (chatIdxs.length) {
                    activeChatIdx = chatIdxs[0];
                } else {
                    let folderNewIdx = -1;
                    for (let i = folderData.length - 1; i >= 0; i--) {
                        if (folderData[i].idxs.length) {
                            folderNewIdx = i;
                        }
                    }
                    if (folderNewIdx !== -1) {
                        activeChatIdx = folderData[folderNewIdx].idxs[0];
                    } else {
                        activeChatIdx = -1;
                    }
                }
            }
        }
        if (activeChatIdx > idx) activeChatIdx--;
        chatsData.splice(idx, 1);
        ele.remove();
        folderData.forEach(item => {
            if (item.idxs.length) {
                item.idxs.forEach((i, ix) => {
                    if (i > idx) {
                        item.idxs[ix] = i - 1;
                    }
                })
            }
        })
        chatIdxs.forEach((item, ix) => {
            if (item > idx) chatIdxs[ix] = item - 1;
        })
        if (activeChatIdx === -1) {
            addNewChat();
            activeChatIdx = 0;
            chatEleAdd(activeChatIdx);
        }
        updateChats();
        activeChat();
    }
};
const endEditEvent = (ev) => {
    if (!document.getElementById("activeChatEdit").contains(ev.target)) {
        endEditChat();
    }
};
const preventDrag = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
}
const endEditChat = () => {
    if (operateChatIdx !== void 0) {
        let ele = getChatEle(operateChatIdx);
        chatsData[operateChatIdx].name = ele.children[1].children[0].textContent = document.getElementById("activeChatEdit").value;
        ele.lastElementChild.remove();
    } else if (operateFolderIdx !== void 0) {
        let ele = folderListEle.children[operateFolderIdx].children[0];
        folderData[operateFolderIdx].name = ele.children[1].children[0].textContent = document.getElementById("activeChatEdit").value;
        ele.lastElementChild.remove();
    }
    updateChats();
    operateChatIdx = operateFolderIdx = void 0;
    document.body.removeEventListener("mousedown", endEditEvent, true);
}
const toEditName = (idx, ele, type) => {
    let inputEle = document.createElement("input");
    inputEle.id = "activeChatEdit";
    inputEle.setAttribute("draggable", "true");
    inputEle.ondragstart = preventDrag;
    ele.appendChild(inputEle);
    if (type) {
        inputEle.value = chatsData[idx].name;
        operateChatIdx = idx;
    } else {
        inputEle.value = folderData[idx].name;
        operateFolderIdx = idx;
    }
    inputEle.focus();
    inputEle.onkeydown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            endEditChat();
        }
    };
    document.body.addEventListener("mousedown", endEditEvent, true);
    return inputEle;
};
const chatEleEvent = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let idx, folderIdx, inFolderIdx;
    if (chatListEle.contains(this)) {
        idx = Array.prototype.indexOf.call(chatListEle.children, this);
        idx = chatIdxs[idx];
    } else if (folderListEle.contains(this)) {
        folderIdx = Array.prototype.indexOf.call(folderListEle.children, this.parentElement.parentElement);
        inFolderIdx = Array.prototype.indexOf.call(this.parentElement.children, this);
        idx = folderData[folderIdx].idxs[inFolderIdx];
    }
    if (ev.target.className === "chatLi") {
        if (activeChatIdx !== idx) {
            endAll();
            activeChatIdx = idx;
            activeChat(this);
        }
        if (window.innerWidth <= 800) {
            document.body.classList.remove("show-nav");
        }
    } else if (ev.target.dataset.type === "chatEdit") {
        toEditName(idx, this, 1);
    } else if (ev.target.dataset.type === "chatDel") {
        delChat(idx, this, folderIdx, inFolderIdx);
    }
};
const updateChats = () => {
    localStorage.setItem("chats", JSON.stringify(chatsData));
    updateChatIdxs();
};
const updateChatIdxs = () => {
    localStorage.setItem("chatIdxs", JSON.stringify(chatIdxs));
    localStorage.setItem("folders", JSON.stringify(folderData));
}
const createConvEle = (className, append = true) => {
    let div = document.createElement("div");
    div.className = className;
    formatMdEle(div);
    if (append) {
        chatlog.appendChild(div);
    }
    return div;
}
const getChatEle = (idx) => {
    let chatIdx = chatIdxs.indexOf(idx);
    if (chatIdx !== -1) {
        return chatListEle.children[chatIdx];
    } else {
        let inFolderIdx;
        let folderIdx = folderData.findIndex(item => {
            inFolderIdx = item.idxs.indexOf(idx);
            return inFolderIdx !== -1;
        })
        if (folderIdx !== -1) {
            return folderListEle.children[folderIdx].children[1].children[inFolderIdx];
        }
    }
}
const activeChat = (ele) => {
    data = chatsData[activeChatIdx]["data"];
    allEle.querySelectorAll(".activeChatLi").forEach(ele => {
        ele.classList.remove("activeChatLi");
    })
    allEle.querySelectorAll(".activeFolder").forEach(ele => {
        ele.classList.remove("activeFolder")
    })
    if (!ele) ele = getChatEle(activeChatIdx);
    ele.classList.add("activeChatLi");
    activeChatEle = ele;
    if (chatIdxs.indexOf(activeChatIdx) === -1) {
        if (!ele.parentElement.parentElement.classList.contains("expandFolder")) {
            ele.parentElement.parentElement.classList.add("activeFolder");
        }
    }
    if (data[0] && data[0].role === "system") {
        systemRole = data[0].content;
        systemEle.value = systemRole;
        localStorage.setItem("system", systemRole);
    } else {
        systemRole = "";
        systemEle.value = "";
        localStorage.setItem("system", systemRole);
    }
    chatlog.innerHTML = "";
    if (systemRole ? data.length - 1 : data.length) {
        let firstIdx = systemRole ? 1 : 0;
        for (let i = firstIdx; i < data.length; i++) {
            if (data[i].role === "user") {
                createConvEle("request").children[1].textContent = data[i].content;
            } else {
                createConvEle("response").children[1].innerHTML = md.render(data[i].content) || "<br />";
            }
        }
    }
    localStorage.setItem("activeChatIdx", activeChatIdx);
};
newChatEle.onclick = () => {
    endAll();
    addNewChat();
    activeChatIdx = chatsData.length - 1;
    chatEleAdd(activeChatIdx);
    activeChat(chatListEle.lastElementChild);
    chatListEle.parentElement.scrollTop = chatListEle.parentElement.scrollHeight;
};
const initChats = () => {
    let localChats = localStorage.getItem("chats");
    let localFolders = localStorage.getItem("folders");
    let localChatIdxs = localStorage.getItem("chatIdxs")
    let localChatIdx = localStorage.getItem("activeChatIdx");
    activeChatIdx = (localChatIdx && parseInt(localChatIdx)) || 0;
    if (localChats) {
        chatsData = JSON.parse(localChats);
        let folderIdxs = [];
        if (localFolders) {
            folderData = JSON.parse(localFolders);
            for (let i = 0; i < folderData.length; i++) {
                folderEleAdd(i);
                folderIdxs.push(...folderData[i].idxs);
            }
        }
        if (localChatIdxs) {
            chatIdxs = JSON.parse(localChatIdxs);
            for (let i = 0; i < chatIdxs.length; i++) {
                chatEleAdd(chatIdxs[i]);
            }
        } else {
            for (let i = 0; i < chatsData.length; i++) {
                if (folderIdxs.indexOf(i) === -1) {
                    chatIdxs.push(i);
                    chatEleAdd(i);
                }
            }
            updateChatIdxs();
        }
    } else {
        addNewChat();
        chatEleAdd(activeChatIdx);
    }
};
const initExpanded = () => {
    let folderIdx = folderData.findIndex(item => {
        return item.idxs.indexOf(activeChatIdx) !== -1;
    })
    if (folderIdx !== -1) {
        folderListEle.children[folderIdx].classList.add("expandFolder");
    }
}
initChats();
initExpanded();
activeChat();
document.getElementById("clearSearch").onclick = () => {
    searchChatEle.value = "";
    searchChatEle.dispatchEvent(new Event("input"));
    searchChatEle.focus();
}
let compositionFlag;
let lastCompositon;
searchChatEle.addEventListener("compositionstart", () => {
    compositionFlag = true;
});
searchChatEle.addEventListener("compositionend", (ev) => {
    compositionFlag = false;
    if (ev.data.length && ev.data === lastCompositon) {
        searchChatEle.dispatchEvent(new Event("input"));
    }
    lastCompositon = void 0;
});
let searchIdxs = [];
searchChatEle.oninput = (ev) => {
    if (ev.isComposing) lastCompositon = ev.data;
    if (compositionFlag) return;
    let value = searchChatEle.value;
    if (value.length) {
        searchIdxs.length = 0;
        let data = [];
        for (let i = 0; i < chatsData.length; i++) {
            let chatEle = getChatEle(i);
            chatEle.style.display = null;
            let nameIdx = chatsData[i].name.indexOf(value);
            let data = chatsData[i].data.find(item => {
                return item.content.indexOf(value) !== -1
            })
            if (nameIdx !== -1 || data) {
                let ele = chatEle.children[1];
                if (data) {
                    let idx = data.content.indexOf(value);
                    ele.children[1].textContent = (idx > 8 ? "..." : "") + data.content.slice(idx > 8 ? idx - 5 : 0, idx);
                    ele.children[1].appendChild(document.createElement("span"));
                    ele.children[1].lastChild.textContent = value;
                    ele.children[1].appendChild(document.createTextNode(data.content.slice(idx + value.length)))
                } else {
                    initChatEle(i, chatEle);
                }
                if (nameIdx !== -1) {
                    ele.children[0].textContent = (nameIdx > 5 ? "..." : "") + chatsData[i].name.slice(nameIdx > 5 ? nameIdx - 3 : 0, nameIdx);
                    ele.children[0].appendChild(document.createElement("span"));
                    ele.children[0].lastChild.textContent = value;
                    ele.children[0].appendChild(document.createTextNode(chatsData[i].name.slice(nameIdx + value.length)))
                } else {
                    ele.children[0].textContent = chatsData[i].name;
                }
                searchIdxs.push(i);
            } else {
                chatEle.style.display = "none";
                initChatEle(i, chatEle);
            }
        }
        for (let i = 0; i < folderListEle.children.length; i++) {
            let folderChatEle = folderListEle.children[i].children[1];
            if (!folderChatEle.children.length || Array.prototype.filter.call(folderChatEle.children, (ele) => {
                return ele.style.display !== "none"
            }).length === 0) {
                folderListEle.children[i].style.display = "none";
            }
        }
    } else {
        searchIdxs.length = 0;
        for (let i = 0; i < chatsData.length; i++) {
            let chatEle = getChatEle(i);
            chatEle.style.display = null;
            initChatEle(i, chatEle);
        }
        for (let i = 0; i < folderListEle.children.length; i++) {
            folderListEle.children[i].style.display = null;
        }
    }
}
document.getElementById("exportChat").onclick = () => {
    if (loading) stopLoading();
    let data = {
        chatsData: chatsData,
        folderData: folderData,
        chatIdxs: chatIdxs
    }
    let blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    let date = new Date();
    let fileName = "chats-" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ".json";
    downBlob(blob, fileName);
};
const blobToText = (blob) => {
    return new Promise((res, rej) => {
        let reader = new FileReader();
        reader.readAsText(blob);
        reader.onload = () => {
            res(reader.result);
        }
        reader.onerror = (error) => {
            rej(error);
        }
    })
};
document.getElementById("importChatInput").onchange = function () {
    let file = this.files[0];
    blobToText(file).then(text => {
        try {
            let json = JSON.parse(text);
            let checked = json.chatsData && json.folderData && json.chatIdxs && json.chatsData.every(item => {
                return item.name !== void 0 && item.data !== void 0;
            });
            if (checked) {
                let preFolder = folderData.length;
                let preLen = chatsData.length;
                if (json.chatsData) {
                    chatsData = chatsData.concat(json.chatsData);
                }
                if (json.folderData) {
                    for (let i = 0; i < json.folderData.length; i++) {
                        json.folderData[i].idxs = json.folderData[i].idxs.map(item => {
                            return item + preLen;
                        })
                        folderData.push(json.folderData[i]);
                        folderEleAdd(i + preFolder);
                    }
                }
                if (json.chatIdxs) {
                    for (let i = 0; i < json.chatIdxs.length; i++) {
                        let newIdx = json.chatIdxs[i] + preLen;
                        chatIdxs.push(newIdx)
                        chatEleAdd(newIdx);
                    }
                }
                updateChats();
            } else {
                throw new Error("格式检查不通过")
            }
        } catch (e) {
            notyf.error("导入失败，请检查文件是否正确！")
        }
        this.value = "";
    })
};
document.getElementById("clearChat").onclick = () => {
    if (confirmAction("是否清空所有会话和文件夹?")) {
        chatsData.length = 0;
        chatIdxs.length = 0;
        folderData.length = 0;
        folderListEle.innerHTML = "";
        chatListEle.innerHTML = "";
        endAll();
        addNewChat();
        activeChatIdx = 0;
        chatEleAdd(activeChatIdx);
        updateChats();
        activeChat(chatListEle.firstElementChild);
    }
};
const endAll = () => {
    endSpeak();
    if (editingIdx !== void 0) resumeSend();
    if (loading) stopLoading();
};
const processIdx = (plus) => {
    if (currentVoiceIdx !== void 0) currentVoiceIdx += plus;
    if (editingIdx !== void 0) editingIdx += plus;
}
const initSetting = () => {
    const modelEle = document.getElementById("preSetModel");
    let localModel = localStorage.getItem("modelVersion");
    if (localModel) {
        modelVersion = localModel;
        modelEle.value = localModel;
    }
    modelEle.onchange = () => {
        modelVersion = modelEle.value;
        localStorage.setItem("modelVersion", modelVersion);
    }
    modelEle.dispatchEvent(new Event("change"));
    const apiHostEle = document.getElementById("apiHostInput");
    let localApiHost = localStorage.getItem("APIHost");
    if (localApiHost) {
        apiHost = localApiHost;
        apiHostEle.value = localApiHost;
    }
    apiHostEle.onchange = () => {
        apiHost = apiHostEle.value;
        // if (apiHost.length && !apiHost.endsWith("/")) {
        //     apiHost += "/";
        //     apiHostEle.value = apiHost;
        // }
        localStorage.setItem("APIHost", apiHost);
    }
    apiHostEle.dispatchEvent(new Event("change"));
    const keyEle = document.getElementById("keyInput");
    let localKey = localStorage.getItem("APIKey");
    if (localKey) {
        customAPIKey = localKey;
        keyEle.value = localKey;
    }
    keyEle.onchange = () => {
        customAPIKey = keyEle.value;
        localStorage.setItem("APIKey", customAPIKey);
    }
    keyEle.dispatchEvent(new Event("change"));
    if (systemRole === void 0) {
        let localSystem = localStorage.getItem("system");
        if (localSystem) {
            systemRole = localSystem;
            systemEle.value = localSystem;
            data.unshift({role: "system", content: systemRole});
            processIdx(1);
            updateChats();
        } else {
            systemRole = systemEle.value;
        }
    }
    systemEle.onchange = () => {
        systemRole = systemEle.value;
        localStorage.setItem("system", systemRole);
        if (systemRole) {
            if (data[0] && data[0].role === "system") {
                data[0].content = systemRole;
            } else {
                data.unshift({role: "system", content: systemRole});
                processIdx(1);
            }
        } else if (data[0] && data[0].role === "system") {
            data.shift();
            processIdx(-1);
        }
        updateChats();
    }
    const preEle = document.getElementById("preSetSystem");
    preEle.onchange = () => {
        let val = preEle.value;
        if (val && presetRoleData[val]) {
            systemEle.value = presetRoleData[val];
        } else {
            systemEle.value = "";
        }
        systemEle.dispatchEvent(new Event("change"));
        systemEle.focus();
    }
    const topEle = document.getElementById("top_p");
    let localTop = localStorage.getItem("top_p");
    if (localTop) {
        roleNature = parseFloat(localTop);
        topEle.value = localTop;
    }
    topEle.oninput = () => {
        topEle.style.backgroundSize = (topEle.value - topEle.min) * 100 / (topEle.max - topEle.min) + "% 100%";
        roleNature = parseFloat(topEle.value);
        localStorage.setItem("top_p", topEle.value);
    }
    topEle.dispatchEvent(new Event("input"));
    const tempEle = document.getElementById("temp");
    let localTemp = localStorage.getItem("temp");
    if (localTemp) {
        roleTemp = parseFloat(localTemp);
        tempEle.value = localTemp;
    }
    tempEle.oninput = () => {
        tempEle.style.backgroundSize = (tempEle.value - tempEle.min) * 100 / (tempEle.max - tempEle.min) + "% 100%";
        roleTemp = parseFloat(tempEle.value);
        localStorage.setItem("temp", tempEle.value);
    }
    tempEle.dispatchEvent(new Event("input"));
    const speedEle = document.getElementById("textSpeed");
    let localSpeed = localStorage.getItem("textSpeed");
    if (localSpeed) {
        textSpeed = parseFloat(speedEle.min) + (speedEle.max - localSpeed);
        speedEle.value = localSpeed;
    }
    speedEle.oninput = () => {
        speedEle.style.backgroundSize = (speedEle.value - speedEle.min) * 100 / (speedEle.max - speedEle.min) + "% 100%";
        textSpeed = parseFloat(speedEle.min) + (speedEle.max - speedEle.value);
        localStorage.setItem("textSpeed", speedEle.value);
    }
    speedEle.dispatchEvent(new Event("input"));
    const contEle = document.getElementById("enableCont");
    let localCont = localStorage.getItem("enableCont");
    if (localCont) {
        enableCont = localCont === "true";
        contEle.checked = enableCont;
    }
    contEle.onchange = () => {
        enableCont = contEle.checked;
        localStorage.setItem("enableCont", enableCont);
    }
    contEle.dispatchEvent(new Event("change"));
    const longEle = document.getElementById("enableLongReply");
    let localLong = localStorage.getItem("enableLongReply");
    if (localLong) {
        enableLongReply = localLong === "true";
        longEle.checked = enableLongReply;
    }
    longEle.onchange = () => {
        enableLongReply = longEle.checked;
        localStorage.setItem("enableLongReply", enableLongReply);
    }
    longEle.dispatchEvent(new Event("change"));
};
initSetting();
document.getElementById("loadMask").style.display = "none";
const closeEvent = (ev) => {
    if (settingEle.contains(ev.target)) return;
    if (!dialogEle.contains(ev.target)) {
        dialogEle.style.display = "none";
        document.removeEventListener("mousedown", closeEvent, true);
        settingEle.classList.remove("showSetting");
    }
}
settingEle.onmousedown = () => {
    dialogEle.style.display = dialogEle.style.display === "block" ? "none" : "block";
    if (dialogEle.style.display === "block") {
        document.addEventListener("mousedown", closeEvent, true);
        settingEle.classList.add("showSetting");
    } else {
        document.removeEventListener("mousedown", closeEvent, true);
        settingEle.classList.remove("showSetting");
    }
}
let delayId;
const delay = () => {
    return new Promise((resolve) => delayId = setTimeout(resolve, textSpeed)); //打字机时间间隔
}
const uuidv4 = () => {
    let uuid = ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    return existVoice === 3 ? uuid.toUpperCase() : uuid;
}
const getTime = () => {
    return existVoice === 3 ? new Date().toISOString() : new Date().toString();
}
const getWSPre = (date, requestId) => {
    let osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
    osPlatform += "/" + navigator.platform;
    let osName = navigator.userAgent;
    let osVersion = navigator.appVersion;
    return `Path: speech.config\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"context":{"system":{"name":"SpeechSDK","version":"1.26.0","build":"JavaScript","lang":"JavaScript","os":{"platform":"${osPlatform}","name":"${osName}","version":"${osVersion}"}}}}`
}
const getWSAudio = (date, requestId) => {
    return existVoice === 3 ? `Path: synthesis.context\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/json\r\n\r\n{"synthesis":{"audio":{"metadataOptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}`
        : `X-Timestamp:${date}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
}
const getWSText = (date, requestId, lang, voice, volume, rate, pitch, style, role, msg) => {
    let fmtVolume = volume === 1 ? "+0%" : volume * 100 - 100 + "%";
    let fmtRate = (rate >= 1 ? "+" : "") + (rate * 100 - 100) + "%";
    let fmtPitch = (pitch >= 1 ? "+" : "") + (pitch - 1) + "Hz";
    msg = getEscape(msg);
    if (existVoice === 3) {
        let fmtStyle = style ? ` style="${style}"` : "";
        let fmtRole = role ? ` role="${role}"` : "";
        let fmtExpress = fmtStyle + fmtRole;
        return `Path: ssml\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${date}\r\nContent-Type: application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${lang}'><voice name='${voice}'><mstts:express-as${fmtExpress}><prosody pitch='${fmtPitch}' rate='${fmtRate}' volume='${fmtVolume}'>${msg}</prosody></mstts:express-as></voice></speak>`;
    } else {
        return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${date}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='${lang}'><voice name='${voice}'><prosody pitch='${fmtPitch}' rate='${fmtRate}' volume='${fmtVolume}'>${msg}</prosody></voice></speak>`;
    }
}
const getAzureWSURL = () => {
    return `wss://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/websocket/v1?Authorization=bearer%20${azureToken}`
}
const edgeTTSURL = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
let currentVoiceIdx;
const resetSpeakIcon = () => {
    if (currentVoiceIdx !== void 0) {
        chatlog.children[systemRole ? currentVoiceIdx - 1 : currentVoiceIdx].classList.remove("showVoiceCls");
        chatlog.children[systemRole ? currentVoiceIdx - 1 : currentVoiceIdx].lastChild.lastChild.className = "voiceCls readyVoice";
    }
}
const endSpeak = () => {
    resetSpeakIcon();
    currentVoiceIdx = void 0;
    if (existVoice >= 2) {
        if (voiceIns) {
            voiceIns.pause();
            voiceIns.currentTime = 0;
            URL.revokeObjectURL(voiceIns.src);
            voiceIns.removeAttribute("src");
            voiceIns.onended = voiceIns.onerror = null;
        }
        sourceBuffer = void 0;
        speechPushing = false;
        if (voiceSocket && voiceSocket["pending"]) {
            voiceSocket.close()
        }
        if (autoVoiceSocket && autoVoiceSocket["pending"]) {
            autoVoiceSocket.close()
        }
        speechQuene.length = 0;
        autoMediaSource = void 0;
        voiceContentQuene = [];
        voiceEndFlagQuene = [];
        voiceBlobURLQuene = [];
        autoOnlineVoiceFlag = false;
    } else {
        speechSynthesis.cancel();
    }
}
const speakEvent = (ins, force = true, end = false) => {
    return new Promise((res, rej) => {
        ins.onerror = () => {
            if (end) {
                endSpeak();
            } else if (force) {
                resetSpeakIcon();
            }
            res();
        }
        if (existVoice >= 2) {
            ins.onended = ins.onerror;
            ins.play();
        } else {
            ins.onend = ins.onerror;
            speechSynthesis.speak(voiceIns);
        }
    })
};
let voiceData = [];
let voiceSocket;
let speechPushing = false;
let speechQuene = [];
let sourceBuffer;
speechQuene.push = function (buffer) {
    if (!speechPushing && (sourceBuffer && !sourceBuffer.updating)) {
        speechPushing = true;
        sourceBuffer.appendBuffer(buffer);
    } else {
        Array.prototype.push.call(this, buffer)
    }
}
const initSocket = () => {
    return new Promise((res, rej) => {
        if (!voiceSocket || voiceSocket.readyState > 1) {
            voiceSocket = new WebSocket(existVoice === 3 ? getAzureWSURL() : edgeTTSURL);
            voiceSocket.binaryType = "arraybuffer";
            voiceSocket.onopen = () => {
                res();
            };
            voiceSocket.onerror = () => {
                rej();
            }
        } else {
            return res();
        }
    })
}
const initStreamVoice = (mediaSource) => {
    return new Promise((r, j) => {
        Promise.all([initSocket(), new Promise(res => {
            mediaSource.onsourceopen = () => {
                res();
            };
        })]).then(() => {
            r();
        })
    })
}
let downQuene = {};
let downSocket;
const downBlob = (blob, name) => {
    let a = document.createElement("a");
    a.download = name;
    a.href = URL.createObjectURL(blob);
    a.click();
}
const initDownSocket = () => {
    return new Promise((res, rej) => {
        if (!downSocket || downSocket.readyState > 1) {
            downSocket = new WebSocket(existVoice === 3 ? getAzureWSURL() : edgeTTSURL);
            downSocket.binaryType = "arraybuffer";
            downSocket.onopen = () => {
                res();
            };
            downSocket.onmessage = (e) => {
                if (e.data instanceof ArrayBuffer) {
                    let text = new TextDecoder().decode(e.data.slice(0, 130));
                    let reqIdx = text.indexOf(":");
                    let uuid = text.slice(reqIdx + 1, reqIdx + 33);
                    downQuene[uuid]["blob"].push(e.data.slice(130));
                } else if (e.data.indexOf("Path:turn.end") !== -1) {
                    let reqIdx = e.data.indexOf(":");
                    let uuid = e.data.slice(reqIdx + 1, reqIdx + 33);
                    let blob = new Blob(downQuene[uuid]["blob"], {type: voiceMIME});
                    let key = downQuene[uuid]["key"];
                    let name = downQuene[uuid]["name"];
                    voiceData[key] = blob;
                    downBlob(blob, name.slice(0, 16) + ".mp3");
                }
            }
            downSocket.onerror = () => {
                rej();
            }
        } else {
            return res();
        }
    })
}
const downloadAudio = async (idx) => {
    if (existVoice < 2) {
        return;
    }
    let type = data[idx].role === "user" ? 0 : 1;
    let voice = existVoice === 3 ? voiceRole[type].ShortName : voiceRole[type].Name;
    let volume = voiceVolume[type];
    let rate = voiceRate[type];
    let pitch = voicePitch[type];
    let style = azureStyle[type];
    let role = azureRole[type];
    let content = data[idx].content;
    let key = content + voice + volume + rate + pitch + (style ? style : "") + (role ? role : "");
    let blob = voiceData[key];
    if (blob) {
        downBlob(blob, content.slice(0, 16) + ".mp3");
    } else {
        await initDownSocket();
        let currDate = getTime();
        let lang = voiceRole[type].lang;
        let uuid = uuidv4();
        if (existVoice === 3) {
            downSocket.send(getWSPre(currDate, uuid));
        }
        downSocket.send(getWSAudio(currDate, uuid));
        downSocket.send(getWSText(currDate, uuid, lang, voice, volume, rate, pitch, style, role, content));
        downSocket["pending"] = true;
        downQuene[uuid] = {};
        downQuene[uuid]["name"] = content;
        downQuene[uuid]["key"] = key;
        downQuene[uuid]["blob"] = [];
    }
}
const NoMSEPending = (key) => {
    return new Promise((res, rej) => {
        let bufArray = [];
        voiceSocket.onmessage = (e) => {
            if (e.data instanceof ArrayBuffer) {
                bufArray.push(e.data.slice(130));
            } else if (e.data.indexOf("Path:turn.end") !== -1) {
                voiceSocket["pending"] = false;
                voiceData[key] = new Blob(bufArray, {type: voiceMIME});
                res(voiceData[key]);
            }
        }
    })
}
const pauseEv = () => {
    if (voiceIns.src) {
        let ele = chatlog.children[systemRole ? currentVoiceIdx - 1 : currentVoiceIdx].lastChild.lastChild;
        ele.classList.remove("readyVoice");
        ele.classList.remove("pauseVoice");
        ele.classList.add("resumeVoice");
    }
}
const resumeEv = () => {
    if (voiceIns.src) {
        let ele = chatlog.children[systemRole ? currentVoiceIdx - 1 : currentVoiceIdx].lastChild.lastChild;
        ele.classList.remove("readyVoice");
        ele.classList.remove("resumeVoice");
        ele.classList.add("pauseVoice");
    }
}
const speechEvent = async (idx) => {
    if (!data[idx]) return;
    endSpeak();
    currentVoiceIdx = idx;
    if (!data[idx].content && enableContVoice) {
        if (currentVoiceIdx !== data.length - 1) {return speechEvent(currentVoiceIdx + 1)}
        else {return endSpeak()}
    };
    let type = data[idx].role === "user" ? 0 : 1;
    chatlog.children[systemRole ? idx - 1 : idx].classList.add("showVoiceCls");
    let voiceIconEle = chatlog.children[systemRole ? idx - 1 : idx].lastChild.lastChild;
    voiceIconEle.className = "voiceCls pauseVoice";
    let content = data[idx].content;
    let volume = voiceVolume[type];
    let rate = voiceRate[type];
    let pitch = voicePitch[type];
    let style = azureStyle[type];
    let role = azureRole[type];
    if (existVoice >= 2) {
        if (!voiceIns) {
            voiceIns = new Audio();
            voiceIns.onpause = pauseEv;
            voiceIns.onplay = resumeEv;
        }
        let voice = existVoice === 3 ? voiceRole[type].ShortName : voiceRole[type].Name;
        let key = content + voice + volume + rate + pitch + (style ? style : "") + (role ? role : "");
        let currData = voiceData[key];
        if (currData) {
            voiceIns.src = URL.createObjectURL(currData);
        } else {
            let mediaSource;
            if (supportMSE) {
                mediaSource = new MediaSource;
                voiceIns.src = URL.createObjectURL(mediaSource);
                await initStreamVoice(mediaSource);
                if (!sourceBuffer) {
                    sourceBuffer = mediaSource.addSourceBuffer(voiceMIME);
                }
                sourceBuffer.onupdateend = function () {
                    speechPushing = false;
                    if (speechQuene.length) {
                        let buf = speechQuene.shift();
                        if (buf["end"]) {
                            mediaSource.endOfStream();
                        } else {
                            speechPushing = true;
                            sourceBuffer.appendBuffer(buf);
                        }
                    }
                };
                let bufArray = [];
                voiceSocket.onmessage = (e) => {
                    if (e.data instanceof ArrayBuffer) {
                        let buf = e.data.slice(130);
                        bufArray.push(buf);
                        speechQuene.push(buf);
                    } else if (e.data.indexOf("Path:turn.end") !== -1) {
                        voiceSocket["pending"] = false;
                        voiceData[key] = new Blob(bufArray, {type: voiceMIME});
                        if (!speechQuene.length && !speechPushing) {
                            mediaSource.endOfStream();
                        } else {
                            let buf = new ArrayBuffer();
                            buf["end"] = true;
                            speechQuene.push(buf);
                        }
                    }
                }
            } else {
                await initSocket();
            }
            let currDate = getTime();
            let lang = voiceRole[type].lang;
            let uuid = uuidv4();
            if (existVoice === 3) {
                voiceSocket.send(getWSPre(currDate, uuid));
            }
            voiceSocket.send(getWSAudio(currDate, uuid));
            voiceSocket.send(getWSText(currDate, uuid, lang, voice, volume, rate, pitch, style, role, content));
            voiceSocket["pending"] = true;
            if (!supportMSE) {
                let blob = await NoMSEPending(key);
                voiceIns.src = URL.createObjectURL(blob);
            }
        }
    } else {
        if (!voiceIns) {
            voiceIns = new SpeechSynthesisUtterance();
        }
        voiceIns.voice = voiceRole[type];
        voiceIns.volume = volume;
        voiceIns.rate = rate;
        voiceIns.pitch = pitch;
        voiceIns.text = content;
    }
    await speakEvent(voiceIns);
    if (enableContVoice) {
        if (currentVoiceIdx !== data.length - 1) {return speechEvent(currentVoiceIdx + 1)}
        else {endSpeak()}
    }
};
let autoVoiceSocket;
let autoMediaSource;
let voiceContentQuene = [];
let voiceEndFlagQuene = [];
let voiceBlobURLQuene = [];
let autoOnlineVoiceFlag = false;
const autoAddQuene = () => {
    if (voiceContentQuene.length) {
        let content = voiceContentQuene.shift();
        let currDate = getTime();
        let uuid = uuidv4();
        let voice = voiceRole[1].Name;
        if (existVoice === 3) {
            autoVoiceSocket.send(getWSPre(currDate, uuid));
            voice = voiceRole[1].ShortName;
        }
        autoVoiceSocket.send(getWSAudio(currDate, uuid));
        autoVoiceSocket.send(getWSText(currDate, uuid, voiceRole[1].lang, voice, voiceVolume[1], voiceRate[1], voicePitch[1], azureStyle[1], azureRole[1], content));
        autoVoiceSocket["pending"] = true;
        autoOnlineVoiceFlag = true;
    }
}
const autoSpeechEvent = (content, ele, force = false, end = false) => {
    if (ele.lastChild.lastChild.classList.contains("readyVoice")) {
        ele.classList.add("showVoiceCls");
        ele.lastChild.lastChild.className = "voiceCls pauseVoice";
    }
    if (existVoice >= 2) {
        voiceContentQuene.push(content);
        voiceEndFlagQuene.push(end);
        if (!voiceIns) {
            voiceIns = new Audio();
            voiceIns.onpause = pauseEv;
            voiceIns.onplay = resumeEv;
        }
        if (!autoVoiceSocket || autoVoiceSocket.readyState > 1) {
            autoVoiceSocket = new WebSocket(existVoice === 3 ? getAzureWSURL() : edgeTTSURL);
            autoVoiceSocket.binaryType = "arraybuffer";
            autoVoiceSocket.onopen = () => {
                autoAddQuene();
            };

            autoVoiceSocket.onerror = () => {
                autoOnlineVoiceFlag = false;
            };
        };
        let bufArray = [];
        autoVoiceSocket.onmessage = (e) => {
            if (e.data instanceof ArrayBuffer) {
                (supportMSE ? speechQuene : bufArray).push(e.data.slice(130));
            } else {
                if (e.data.indexOf("Path:turn.end") !== -1) {
                    autoVoiceSocket["pending"] = false;
                    autoOnlineVoiceFlag = false;
                    if (!supportMSE) {
                        let blob = new Blob(bufArray, {type: voiceMIME});
                        bufArray = [];
                        if (blob.size) {
                            let blobURL = URL.createObjectURL(blob);
                            if (!voiceIns.src) {
                                voiceIns.src = blobURL;
                                voiceIns.play();
                            } else {
                                voiceBlobURLQuene.push(blobURL);
                            }
                        }
                        autoAddQuene();
                    }
                    if (voiceEndFlagQuene.shift()) {
                        if (supportMSE) {
                            if (!speechQuene.length && !speechPushing) {
                                autoMediaSource.endOfStream();
                            } else {
                                let buf = new ArrayBuffer();
                                buf["end"] = true;
                                speechQuene.push(buf);
                            }
                        } else {
                            if (!voiceBlobURLQuene.length && !voiceIns.src) {
                                endSpeak();
                            } else {
                                voiceBlobURLQuene.push("end");
                            }
                        }
                    };
                    if (supportMSE) {
                        autoAddQuene();
                    }
                }
            }
        };
        if (!autoOnlineVoiceFlag && autoVoiceSocket.readyState) {
            autoAddQuene();
        }
        if (supportMSE) {
            if (!autoMediaSource) {
                autoMediaSource = new MediaSource();
                autoMediaSource.onsourceopen = () => {
                    if (!sourceBuffer) {
                        sourceBuffer = autoMediaSource.addSourceBuffer(voiceMIME);
                        sourceBuffer.onupdateend = () => {
                            speechPushing = false;
                            if (speechQuene.length) {
                                let buf = speechQuene.shift();
                                if (buf["end"]) {
                                    autoMediaSource.endOfStream();
                                } else {
                                    speechPushing = true;
                                    sourceBuffer.appendBuffer(buf);
                                }
                            }
                        };
                    }
                }
            }
            if (!voiceIns.src) {
                voiceIns.src = URL.createObjectURL(autoMediaSource);
                voiceIns.play();
                voiceIns.onended = voiceIns.onerror = () => {
                    endSpeak();
                }
            }
        } else {
            voiceIns.onended = voiceIns.onerror = () => {
                if (voiceBlobURLQuene.length) {
                    let src = voiceBlobURLQuene.shift();
                    if (src === "end") {
                        endSpeak();
                    } else {
                        voiceIns.src = src;
                        voiceIns.currentTime = 0;
                        voiceIns.play();
                    }
                } else {
                    voiceIns.currentTime = 0;
                    voiceIns.removeAttribute("src");
                }
            }
        }
    } else {
        voiceIns = new SpeechSynthesisUtterance(content);
        voiceIns.volume = voiceVolume[1];
        voiceIns.rate = voiceRate[1];
        voiceIns.pitch = voicePitch[1];
        voiceIns.voice = voiceRole[1];
        speakEvent(voiceIns, force, end);
    }
};
const confirmAction = (prompt) => {
    if (window.confirm(prompt)) {return true}
    else {return false}
};
let autoVoiceIdx = 0;
let autoVoiceDataIdx;
let controller;
let controllerId;
let refreshIdx;
let currentResEle;
let progressData = "";
const streamGen = async (long) => {
    controller = new AbortController();
    controllerId = setTimeout(() => {
        notyf.error("请求超时，请稍后重试！");
        stopLoading();
    }, 30000);
    let headers = {
        "Content-Type": "application/json",
    };
    if (customAPIKey) headers["Authorization"] = "Bearer " + customAPIKey;
    let isRefresh = refreshIdx !== void 0;
    if (isRefresh) {
        currentResEle = chatlog.children[systemRole ? refreshIdx - 1 : refreshIdx];
    } else if (!currentResEle) {
        currentResEle = createConvEle("response");
        currentResEle.children[1].innerHTML = "<br />";
        currentResEle.dataset.loading = true;
        scrollToBottom();
    }
    let idx = isRefresh ? refreshIdx : data.length;
    if (existVoice && enableAutoVoice && !long) {
        if (isRefresh) {
            endSpeak();
            autoVoiceDataIdx = currentVoiceIdx = idx;
        } else if (currentVoiceIdx !== data.length) {
            endSpeak();
            autoVoiceDataIdx = currentVoiceIdx = idx;
        }
    }
    let dataSlice;
    if (long) {
        idx = isRefresh ? refreshIdx : data.length - 1;
        dataSlice = [data[idx - 1], data[idx]];
        if (systemRole) {dataSlice.unshift(data[0]);}
    } else if (enableCont) {
        dataSlice = data.slice(0, idx);
    } else {
        dataSlice = [data[idx - 1]];
        if (systemRole) {dataSlice.unshift(data[0]);}
    }
    try {
        const res = await fetch(apiHost, {
            method: "POST",
            headers,
            body: JSON.stringify({
                messages: dataSlice,
                model: modelVersion,
                stream: true,
                temperature: roleTemp,
                top_p: roleNature
            }),
            signal: controller.signal
        });
        clearTimeout(controllerId);
        controllerId = void 0;
        if (res.status !== 200) {
            if (res.status === 401) {
                notyf.error("API key错误或失效，请检查API key！")
            } else if (res.status === 400) {
                notyf.error("请求内容过大，请删除部分对话或打开设置关闭连续对话！");
            } else if (res.status === 404) {
                notyf.error("无权使用此模型，请打开设置选择其他GPT模型！");
            } else if (res.status === 429) {
                notyf.error(res.statusText ? "触发API调用频率限制，请稍后重试！" : "API使用超出限额，请检查您的账单！");
            } else {
                notyf.error("网关错误或超时，请稍后重试！");
            }
            stopLoading();
            return;
        }
        const decoder = new TextDecoder();
        const reader = res.body.getReader();
        const readChunk = async () => {
            return reader.read().then(async ({value, done}) => {
                if (!done) {
                    value = decoder.decode(value);
                    let chunks = value.match(/[^\n]+/g);
                    for (let i = 0; i < chunks.length; i++) {
                        let chunk = chunks[i];
                        if (chunk) {
                            let payload;
                            try {
                                payload = JSON.parse(chunk.slice(6));
                            } catch (e) {
                                break;
                            }
                            if (payload.choices[0].finish_reason) {
                                let lenStop = payload.choices[0].finish_reason === "length";
                                let longReplyFlag = enableLongReply && lenStop;
                                let ele = currentResEle.lastChild.children[0].children[0];
                                if (!enableLongReply && lenStop) {ele.className = "halfRefReq optionItem"; ele.title = "继续"}
                                else {ele.className = "refreshReq optionItem"; ele.title = "刷新"};
                                if (existVoice && enableAutoVoice && currentVoiceIdx === autoVoiceDataIdx) {
                                    let voiceText = longReplyFlag ? "" : progressData.slice(autoVoiceIdx), stop = !longReplyFlag;
                                    autoSpeechEvent(voiceText, currentResEle, false, stop);
                                }
                                break;
                            } else {
                                let content = payload.choices[0].delta.content;
                                if (content) {
                                    if (!progressData && !content.trim()) continue;
                                    if (existVoice && enableAutoVoice && currentVoiceIdx === autoVoiceDataIdx) {
                                        let spliter = content.match(/\.|\?|!|~|。|？|！|\n/);
                                        if (spliter) {
                                            let voiceText = progressData.slice(autoVoiceIdx) + content.slice(0, spliter.index + 1);
                                            autoVoiceIdx += voiceText.length;
                                            autoSpeechEvent(voiceText, currentResEle);
                                        }
                                    }
                                    if (progressData) await delay();
                                    progressData += content;
                                    currentResEle.children[1].innerHTML = md.render(progressData);
                                    if (!isRefresh) {
                                        scrollToBottom();
                                    }
                                }
                            }
                        }
                    }
                    return readChunk();
                } else {
                    if (isRefresh) {
                        data[refreshIdx].content = progressData;
                        if (longReplyFlag) return streamGen(true);
                    } else {
                        if (long) {data[data.length - 1].content = progressData}
                        else {data.push({role: "assistant", content: progressData})}
                        if (longReplyFlag) return streamGen(true);
                    }
                    stopLoading(false);
                }
            });
        };
        await readChunk();
    } catch (e) {
        if (e.message.indexOf("aborted") === -1) {
            notyf.error("访问接口失败，请检查接口！")
            stopLoading();
        }
    }
};
const loadAction = (bool) => {
    loading = bool;
    sendBtnEle.disabled = bool;
    sendBtnEle.className = bool ? " loading" : "loaded";
    stopEle.style.display = bool ? "flex" : "none";
    textInputEvent();
}
const stopLoading = (abort = true) => {
    stopEle.style.display = "none";
    if (abort) {
        controller.abort();
        if (controllerId) clearTimeout(controllerId);
        if (delayId) clearTimeout(delayId);
        if (refreshIdx !== void 0) {data[refreshIdx].content = progressData}
        else if (data[data.length - 1].role === "assistant") {data[data.length - 1].content = progressData}
        else {data.push({role: "assistant", content: progressData})}
        if (existVoice && enableAutoVoice && currentVoiceIdx === autoVoiceDataIdx && progressData.length) {
            let voiceText = progressData.slice(autoVoiceIdx);
            autoSpeechEvent(voiceText, currentResEle, false, true);
        }
    }
    if (activeChatEle.children[1].children[1].textContent === "") {
        let first = data.find(item => {return item.role === "assistant"});
        if (first) {activeChatEle.children[1].children[1].textContent = first.content.slice(0, 30)}
    }
    updateChats();
    controllerId = delayId = refreshIdx = autoVoiceDataIdx = void 0;
    autoVoiceIdx = 0;
    currentResEle.dataset.loading = false;
    currentResEle = null;
    progressData = "";
    loadAction(false);
}
const generateText = (message) => {
    loadAction(true);
    let requestEle;
    if (editingIdx !== void 0) {
        let idx = editingIdx;
        let eleIdx = systemRole ? idx - 1 : idx;
        requestEle = chatlog.children[eleIdx];
        data[idx].content = message;
        resumeSend();
        if (idx !== data.length - 1) {
            requestEle.children[1].textContent = message;
            if (data[idx + 1].role !== "assistant") {
                if (currentVoiceIdx !== void 0) {
                    if (currentVoiceIdx > idx) {currentVoiceIdx++}
                }
                data.splice(idx + 1, 0, {role: "assistant", content: ""});
                chatlog.insertBefore(createConvEle("response", false), chatlog.children[eleIdx + 1]);
            }
            chatlog.children[eleIdx + 1].children[1].innerHTML = "<br />";
            chatlog.children[eleIdx + 1].dataset.loading = true;
            idx = idx + 1;
            data[idx].content = "";
            if (idx === currentVoiceIdx) {endSpeak()};
            refreshIdx = idx;
            updateChats();
            streamGen();
            return;
        }
    } else {
        requestEle = createConvEle("request");
        data.push({role: "user", content: message});
    }
    requestEle.children[1].textContent = message;
    if (chatsData[activeChatIdx].name === "新的会话") {
        if (message.length > 20) message = message.slice(0, 17) + "...";
        chatsData[activeChatIdx].name = message;
        activeChatEle.children[1].children[0].textContent = message;
    }
    updateChats();
    scrollToBottom();
    streamGen();
};
textarea.onkeydown = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        genFunc();
    }
};
const genFunc = function () {
    if (recing) {
        toggleRecEv();
    }
    let message = textarea.value.trim();
    if (message.length !== 0 && noLoading()) {
        textarea.value = "";
        textarea.style.height = "47px";
        generateText(message);
    }
};
sendBtnEle.onclick = genFunc;
stopEle.onclick = stopLoading;
clearEle.onclick = () => {
    if (editingIdx === void 0) {
        if (noLoading() && confirmAction("是否清空会话?")) {
            endSpeak();
            if (systemRole) {data.length = 1}
            else {data.length = 0}
            chatlog.innerHTML = "";
            updateChats();
        }
    } else {
        resumeSend();
    }
}