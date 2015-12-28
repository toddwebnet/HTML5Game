/*!
* ============================================================================
*   Creative Innovation Center, LG ELECTRONICS INC., SEOUL, KOREA                       
*   Copyright(c) 2014 by LG Electronics Inc.                                  
*                                                                             
*   Release Version : 1.18.0.3951                              
* ============================================================================
*/
var hcap;
/******* ADDED - BR *********/
var _trace = false; /* important to only set to true when debugging, since the IP address is hardcoded below - BR */

/* this function provides a trace - will send data directly to the udp listener for debugging
* purposes */
function trace( logData ) {
   if ( !_trace ) { return; }

   hcap.socket.sendUdpData({
      "ip": "192.168.199.166"
      ,"port": 7070
      ,"udpData": "<clientData>"
      + "<dataType>LOG</dataType>"
      + "<message>**** TRACE ****: " + logData + "</message>"
      + "</clientData>"
   });
}
/******* END ADDED - BR *********/
if (hcap === undefined) {
    (function() {
        hcap = {
            API_VERSION: "1.18.0.3951"
        };
        var a = {};
        var o = [];
        var l = false;

        function p() {
            var q = navigator.userAgent;
            console.log("UA = '" + q + "'");
            var s = q.match(/Windows/);
            var r = q.match(/Macintosh/);
            var t = q.match(/Mac OS X/);
            if (s || r || t) {
                console.log("HCAP websocket off");
                return true
            }
            return false
        }
        var d = p();
        var h = function(y, r) {
            var s = 0,
                q = "",
                u = [],
                x = "",
                w = "",
                v = "";
            for (q in r) {
                if (r.hasOwnProperty(q)) {
                    u.push(q)
                }
            }
            u.sort();
            for (s = 0; s < u.length; s++) {
                q = u[s];
                try {
                    w = r[q];
                    v = typeof w
                } catch (t) {
                    w = "<unknown value>";
                    v = "unknown"
                }
                if (v === "function") {
                    w = "{/*source code suppressed*/}"
                }
                x += q + " : " + w;
                if (s < u.length - 1) {
                    x += ", "
                }
            }
            return "\n" + y + " -> " + x
        };
        a.on_event_received = function(u, t) {
            var s = "";
            if (l) {
                console.log("event = " + u);
                console.log(h("event", t))
            }
            var r = u;
            var q = document.createEvent("HTMLEvents");
            q.initEvent(r, true, false);
            for (s in t) {
                if (t.hasOwnProperty(s)) {
                    q[s] = t[s]
                }
            }
            document.dispatchEvent(q)
        };
        var e = 0;
        var i = [];
        var k = null;
        var n = false;
        var c = false;
        var m = false;
        var b = null;
        var f = null;
        var j = null;
        b = function() {
            if (c) {
                console.log("\nis now connecting..");
                return
            }
            c = true;
            k = new WebSocket("ws://127.0.0.1:8053/hcap_command");
            k.onopen = function() {
                console.log("\nwebsocket : onopen");
                c = false;
                n = true;
                setTimeout(f(), 50)
            };
            k.onmessage = function(q) {
                var s = q.data,
                    v = JSON.parse(q.data);
                console.log("\nwebsocket : onmessage : " + s);
                var r = v.command_id;
                var u = v.command;
                var t = v.result;
                if (r === "event") {
                    if (u === "debug_event_received") {
                        l = v.enable_log
                    } else {
                        a.on_event_received(u, v)
                    }
                } else {
                    if (i.length > 0 && i[0].command_id === r) {
                        console.log("command_id = " + r + " received");
                        if (t) {
                            if (i[0].onSuccess) {
                                i[0].onSuccess(v)
                            }
                        } else {
                            if (i[0].onFailure) {
                                i[0].onFailure(v)
                            }
                        }
                        i.splice(0, 1);
                        m = false;
                        setTimeout(f(), 50)
                    } else {
                        console.log("\ninvalid response from server");
                        m = false;
                        setTimeout(f(), 50)
                    }
                }
            };
            k.onclose = function() {
                console.log("\nwebsocket : onclose");
                c = false;
                n = false;
                setTimeout(f(), 50)
            }
        };
        f = function() {
            if (m) {
                return
            }
            m = true;
            if (n) {
                if (i.length > 0) {
                    console.log("command_id = " + i[0].command_id + " sent");
                    k.send(i[0].param_text);
                    return
                }
            } else {
                b()
            }
            m = false
        };
        j = function(t, s) {
            if (t === null || t === "" || s === null) {
                return
            }
            if (d) {
                if (s.onFailure) {
                    s.onFailure({
                        errorMessage: "HCAP WebSocket is not available in this browser"
                    })
                }
                return
            }
            if (l) {
                console.log(h(s.command, s))
            }
            if (e > 1024) {
                e = 0
            } else {
                e++
            }
            var q = e.toString();
            s.command_id = q;
            s.command = t;
            var r = JSON.stringify(s, null);
            i[i.length] = {
                command_id: q,
                param_text: r,
                onSuccess: s.onSuccess,
                onFailure: s.onFailure
            };
            console.log("command_id = " + q + " added, param_text = " + r);
            setTimeout(f(), 50)
        };
        if (!d) {
            setTimeout(f(), 50)
        }
        hcap.preloadedApplication = {};
        hcap.preloadedApplication.getPreloadedApplicationList = function(q) {
            j("get_preloaded_application_list", q)
        };
        hcap.preloadedApplication.launchPreloadedApplication = function(q) {
            j("launch_preloaded_application", q)
        };
        hcap.video = {};
        hcap.video.getVideoSize = function(q) {
            j("get_video_size", q)
        };
        hcap.video.setVideoSize = function(q) {
            j("set_video_size", q)
        };
        hcap.video.getOsdTransparencyLevel = function(q) {
            j("get_osd_transparency_level", q)
        };
        hcap.video.setOsdTransparencyLevel = function(q) {
            j("set_osd_transparency_level", q)
        };
        hcap.video.isVideoMute = function(q) {
            j("get_video_mute", q)
        };
        hcap.video.setVideoMute = function(q) {
            j("set_video_mute", q)
        };
        hcap.volume = {};
        hcap.volume.getVolumeLevel = function(q) {
            j("get_volume_level", q)
        };
        hcap.volume.setVolumeLevel = function(q) {
            j("set_volume_level", q)
        };
        hcap.channel = {};
        hcap.channel.NO_STREAM_PID = 8191;
        hcap.channel.ChannelType = {
            UNKNOWN: 0,
            RF: 1,
            IP: 2,
            RF_DATA: 3,
            IP_DATA: 4
        };
        hcap.channel.Polarization = {
            UNKNOWN: 0,
            VERTICAL: 1,
            HORIZONTAL: 2,
            LEFT_HAND_CIRCULAR: 3,
            RIGHT_HAND_CIRCULAR: 4
        };
        hcap.channel.RfBroadcastType = {
            UNKNOWN: 0,
            TERRESTRIAL: 16,
            SATELLITE: 32,
            SATELLITE_2: 33,
            CABLE: 48,
            CABLE_STD: 49,
            CABLE_HRC: 50,
            CABLE_IRC: 51,
            ANALOG_PAL_BG: 64,
            ANALOG_PAL_DK: 65,
            ANALOG_PAL_I: 66,
            ANALOG_PAL_M: 67,
            ANALOG_PAL_N: 68,
            ANALOG_SECAM_BG: 69,
            ANALOG_SECAM_DK: 70,
            ANALOG_SECAM_L: 71,
            ANALOG_NTSC: 72
        };
        hcap.channel.IpBroadcastType = {
            UNKNOWN: 0,
            UDP: 16,
            RTP: 32
        };
        hcap.channel.VideoStreamType = {
            MPEG1: 1,
            MPEG2: 2,
            MPEG4_VISUAL: 16,
            MPEG4_AVC_H264: 27,
            AVS: 66
        };
        hcap.channel.AudioStreamType = {
            MPEG1: 3,
            MPEG2: 4,
            MPEG2_AAC: 15,
            MPEG4_HEAAC: 17,
            AC3: 129,
            EAC3: 130,
            ANALOG_BG: 256,
            ANALOG_I: 257,
            ANALOG_DK: 258,
            ANALOG_L: 259,
            ANALOG_MN: 260,
            ANALOG_LP: 261,
            ANALOG_END: 262
        };
        hcap.channel.InbandDataServiceType = {
            UNKNOWN: 0,
            MHP: 1,
            MHEG: 2,
            HBBTV: 3,
            NONE: 4
        };
        hcap.channel.ChannelStatus = {
            UNKNOWN: 0,
            AUDIO_VIDEO_NOT_BLOCKED: 16,
            AV_DISPLAYED: 16,
            AUDIO_VIDEO_BLOCKED: 33,
            NO_SIGNAL: 33,
            AUDIO_ONLY_BLOCKED: 34,
            VIDEO_ONLY_BLOCKED: 35
        };
        hcap.channel.requestChangeCurrentChannel = function(q) {
            j("request_channel_change", q)
        };
        hcap.channel.getCurrentChannel = function(q) {
            j("get_current_channel", q)
        };
        hcap.channel.replayCurrentChannel = function(q) {
            j("replay_current_channel", q)
        };
        hcap.channel.stopCurrentChannel = function(q) {
            j("stop_current_channel", q)
        };
        hcap.channel.getDataChannel = function(q) {
            j("get_data_channel", q)
        };
        hcap.channel.getStartChannel = function(q) {
            j("get_start_channel", q)
        };
        hcap.channel.setStartChannel = function(q) {
            j("set_start_channel", q)
        };
        hcap.channel.getCurrentChannelAudioLanguageList = function(q) {
            j("get_current_channel_audio_language_list", q)
        };
        hcap.channel.getCurrentChannelAudioLanguageIndex = function(q) {
            j("get_current_channel_audio_language_index", q)
        };
        hcap.channel.setCurrentChannelAudioLanguageIndex = function(q) {
            j("set_current_channel_audio_language_index", q)
        };
        hcap.channel.getCurrentChannelSubtitleList = function(q) {
            j("get_current_channel_subtitle_language_list", q)
        };
        hcap.channel.getCurrentChannelSubtitleIndex = function(q) {
            j("get_current_channel_subtitle_language_index", q)
        };
        hcap.channel.setCurrentChannelSubtitleIndex = function(q) {
            j("set_current_channel_subtitle_language_index", q)
        };
        hcap.channel.getProgramInfo = function(q) {
            j("get_program_info", q)
        };
        hcap.channel.launchInbandDataService = function(q) {
            j("launch_inband_data_service", q)
        };
        hcap.channel.getReadyInbandDataService = function(q) {
            j("get_ready_inband_data_service", q)
        };
        hcap.externalinput = {};
        hcap.externalinput.ExternalInputType = {
            TV: 1,
            COMPOSITE: 2,
            SVIDEO: 3,
            COMPONENT: 4,
            RGB: 5,
            HDMI: 6,
            SCART: 7,
            USB: 8,
            OTHERS: 9
        };
        hcap.externalinput.getCurrentExternalInput = function(q) {
            j("get_external_input", q)
        };
        hcap.externalinput.setCurrentExternalInput = function(q) {
            j("set_external_input", q)
        };
        hcap.externalinput.isExternalInputConnected = function(q) {
            j("check_external_input_connected", q)
        };
        hcap.carousel = {};
        hcap.carousel.requestCacheCarouselData = function(q) {
            j("request_content", q)
        };
        hcap.carousel.isCarouselDataCached = function(q) {
            j("is_content_loaded", q)
        };
        hcap.carousel.clearCarouselDataCache = function(q) {
            j("clear_content_cache", q)
        };
        hcap.mpi = {};
        hcap.mpi.sendAndReceiveMpiData = function(q) {
            j("send_and_receive_mpi_data", q)
        };
        hcap.mpi.sendMpiData = function(q) {
            j("send_mpi_data", q)
        };
        hcap.power = {};
        hcap.power.PowerMode = {
            WARM: 2,
            NORMAL: 1
        };
        hcap.power.getPowerMode = function(q) {
            j("get_power_mode", q)
        };
        hcap.power.setPowerMode = function(q) {
            j("set_power_mode", q)
        };
        hcap.power.powerOff = function(q) {
            j("power_off", q)
        };
        hcap.power.reboot = function(q) {
            j("reboot", q)
        };
        hcap.time = {};
        hcap.time.setLocalTime = function(q) {
            j("set_tv_localtime", q)
        };
        hcap.time.getLocalTime = function(q) {
            j("get_tv_localtime", q)
        };
        hcap.time.getPowerOffTimer = function(q) {
            j("get_power_off_timer_in_min", q)
        };
        hcap.time.setPowerOffTimer = function(q) {
            j("set_power_off_timer_in_min", q)
        };
        hcap.time.getPowerOnTime = function(q) {
            j("get_power_on_time", q)
        };
        hcap.time.setPowerOnTime = function(q) {
            j("set_power_on_time", q)
        };
        hcap.time.getAlarmInformation = function(q) {
            j("get_alarm_information", q)
        };
        hcap.time.setAlarmInformation = function(q) {
            j("set_alarm_information", q)
        };
        hcap.network = {};
        hcap.network.getNumberOfNetworkDevices = function(q) {
            j("get_number_of_network_devices", q)
        };
        hcap.network.getNetworkDevice = function(q) {
            j("get_network_device", q)
        };
        hcap.network.ping = function(q) {
            j("ping", q)
        };
        hcap.network.NetworkEventType = {
            UNKNOWN: 0,
            ETHERNET_PLUGGED: 1,
            ETHERNET_UNPLUGGED: 2,
            WIFI_DONGLE_PLUGGED: 3,
            WIFI_DONGLE_UNPLUGGED: 4,
            IP_CONFLICT: 5,
            IP_NOT_CONFLICT: 6,
            DHCP_SUCCESS: 7,
            DHCP_FAIL: 8,
            UNABLE_REACH_GATEWAY: 9,
            ABLE_REACH_GATEWAY: 10,
            UNABLE_REACH_DNS: 11,
            ABLE_REACH_DNS: 12,
            UNABLE_REACH_INTERNET: 13,
            ABLE_REACH_INTERNET: 14,
            WIFI_AP_SEARCH_COMPLETE: 15,
            WIFI_CONNECTED: 16,
            WIFI_CONNECT_FAIL: 17,
            WIFI_LINK_DROPPED: 18
        };
        hcap.network.NetworkMode = {
            UNKNOWN: 0,
            WIRE: 1,
            WIRELESS: 2,
            NOT_REACHABLE: 3
        };
        hcap.network.WirelessMode = {
            UNKNOWN: 0,
            INFRA: 1,
            ADHOC: 2
        };
        hcap.network.WifiSecurityType = {
            UNKNOWN: 0,
            OPEN: 1,
            WEP: 2,
            WPA_PSK_TKIP: 3,
            WPA_PSK_AES: 4,
            WPA2_PSK_TKIP: 5,
            WPA2_PSK_AES: 6,
            WPA12_PSK_AES_TKIPAES: 7
        };
        hcap.network.DhcpState = {
            UNKNOWN: 0,
            INIT: 1,
            SELECTING: 2,
            REQUESTING: 3,
            BOUND: 4,
            RENEWING: 5,
            REBINDING: 6,
            INIT_REBOOT: 7,
            REBOOTING: 8
        };
        hcap.network.getNetworkInformation = function(q) {
            j("get_network_information", q)
        };
        hcap.mode = {};
        hcap.mode.HCAP_MODE_0 = 257;
        hcap.mode.HCAP_MODE_1 = 258;
        hcap.mode.HCAP_MODE_2 = 259;
        hcap.mode.HCAP_MODE_3 = 260;
        hcap.mode.HCAP_MODE_4 = 261;
        hcap.mode.getHcapMode = function(q) {
            j("get_mw_mode", q)
        };
        hcap.mode.setHcapMode = function(q) {
            j("set_mw_mode", q)
        };
        hcap.key = {};
        hcap.key.Code = {
            NUM_0: 48,
            NUM_1: 49,
            NUM_2: 50,
            NUM_3: 51,
            NUM_4: 52,
            NUM_5: 53,
            NUM_6: 54,
            NUM_7: 55,
            NUM_8: 56,
            NUM_9: 57,
            CH_UP: 427,
            CH_DOWN: 428,
            GUIDE: 458,
            INFO: 457,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            ENTER: 13,
            BACK: 461,
            EXIT: 1001,
            RED: 403,
            GREEN: 404,
            YELLOW: 405,
            BLUE: 406,
            STOP: 413,
            PLAY: 415,
            PAUSE: 19,
            REWIND: 412,
            FAST_FORWARD: 417,
            LAST_CH: 711,
            PORTAL: 602,
            ORDER: 623,
            MINUS: 704,
            POWER: 409,
            VOL_UP: 447,
            VOL_DOWN: 448,
            MUTE: 449,
            RECORD: 416,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            RF_BYPASS: 29,
            NEXT_DAY: 425,
            PREV_DAY: 424,
            APPS: 93,
            LINK: 606,
            FORWARD: 167,
            ZOOM: 251,
            SETTINGS: 611,
            NEXT_FAV_CH: 176,
            RES_1: 112,
            RES_2: 113,
            RES_3: 114,
            RES_4: 115,
            RES_5: 116,
            RES_6: 117,
            LOCK: 619,
            SKIP: 620,
            LIST: 1006,
            LIVE: 622,
            ON_DEMAND: 623,
            PINP_MOVE: 624,
            PINP_UP: 625,
            PINP_DOWN: 626,
            MENU: 18,
            AD: 700,
            ALARM: 701,
            AV_MODE: 31,
            SUBTITLE: 460,
            CC: 1008,
            DISC_POWER_OFF: 705,
            DISC_POWER_ON: 706,
            DVD: 707,
            EJECT: 414,
            ENERGY_SAVING: 709,
            FAV: 710,
            FLASHBK: 711,
            INPUT: 712,
            MARK: 713,
            NETCAST: 1000,
            PIP: 715,
            PIP_CH_DOWN: 716,
            PIP_CH_UP: 717,
            PIP_INPUT: 718,
            PIP_SWAP: 719,
            Q_MENU: 1002,
            Q_VIEW: 1007,
            RATIO: 1005,
            SAP: 723,
            SIMPLINK: 724,
            STB: 725,
            T_OPT: 1004,
            TEXT: 459,
            SLEEP_TIMER: 729,
            TV: 730,
            TV_RAD: 731,
            VCR: 732,
            POWER_LOWBATTERY: 733,
            SMART_HOME: 734,
            SCREEN_REMOTE: 735,
            POINTER: 736,
            LG_3D: 737
        };
        o[hcap.key.Code.CH_DOWN] = hcap.key.Code.CH_DOWN;
        o[hcap.key.Code.CH_UP] = hcap.key.Code.CH_UP;
        o[hcap.key.Code.MINUS] = 45;
        o[hcap.key.Code.NUM_0] = hcap.key.Code.NUM_0;
        o[hcap.key.Code.NUM_1] = hcap.key.Code.NUM_1;
        o[hcap.key.Code.NUM_2] = hcap.key.Code.NUM_2;
        o[hcap.key.Code.NUM_3] = hcap.key.Code.NUM_3;
        o[hcap.key.Code.NUM_4] = hcap.key.Code.NUM_4;
        o[hcap.key.Code.NUM_5] = hcap.key.Code.NUM_5;
        o[hcap.key.Code.NUM_6] = hcap.key.Code.NUM_6;
        o[hcap.key.Code.NUM_7] = hcap.key.Code.NUM_7;
        o[hcap.key.Code.NUM_8] = hcap.key.Code.NUM_8;
        o[hcap.key.Code.NUM_9] = hcap.key.Code.NUM_9;
        o[hcap.key.Code.UP] = hcap.key.Code.UP;
        o[hcap.key.Code.DOWN] = hcap.key.Code.DOWN;
        o[hcap.key.Code.LEFT] = hcap.key.Code.LEFT;
        o[hcap.key.Code.RIGHT] = hcap.key.Code.RIGHT;
        o[hcap.key.Code.ENTER] = 10;
        o[hcap.key.Code.VOL_DOWN] = hcap.key.Code.VOL_DOWN;
        o[hcap.key.Code.VOL_UP] = hcap.key.Code.VOL_UP;
        o[hcap.key.Code.MUTE] = hcap.key.Code.MUTE;
        o[hcap.key.Code.PAUSE] = hcap.key.Code.PAUSE;
        o[hcap.key.Code.PLAY] = hcap.key.Code.PLAY;
        o[hcap.key.Code.STOP] = hcap.key.Code.STOP;
        o[hcap.key.Code.RECORD] = hcap.key.Code.RECORD;
        o[hcap.key.Code.FAST_FORWARD] = hcap.key.Code.FAST_FORWARD;
        o[hcap.key.Code.REWIND] = hcap.key.Code.REWIND;
        o[hcap.key.Code.GUIDE] = hcap.key.Code.GUIDE;
        o[hcap.key.Code.INFO] = hcap.key.Code.INFO;
        o[hcap.key.Code.RED] = hcap.key.Code.RED;
        o[hcap.key.Code.GREEN] = hcap.key.Code.GREEN;
        o[hcap.key.Code.YELLOW] = hcap.key.Code.YELLOW;
        o[hcap.key.Code.BLUE] = hcap.key.Code.BLUE;
        o[hcap.key.Code.PAGE_UP] = hcap.key.Code.PAGE_UP;
        o[hcap.key.Code.PAGE_DOWN] = hcap.key.Code.PAGE_DOWN;
        o[hcap.key.Code.RF_BYPASS] = 600;
        o[hcap.key.Code.EXIT] = 601;
        o[hcap.key.Code.PORTAL] = hcap.key.Code.PORTAL;
        o[hcap.key.Code.NEXT_DAY] = 603;
        o[hcap.key.Code.PREV_DAY] = 604;
        o[hcap.key.Code.APPS] = 605;
        o[hcap.key.Code.LINK] = hcap.key.Code.LINK;
        o[hcap.key.Code.LAST_CH] = 607;
        o[hcap.key.Code.BACK] = 608;
        o[hcap.key.Code.FORWARD] = 417;
        o[hcap.key.Code.ZOOM] = 610;
        o[hcap.key.Code.SETTINGS] = hcap.key.Code.SETTINGS;
        o[hcap.key.Code.NEXT_FAV_CH] = 612;
        o[hcap.key.Code.RES_1] = 613;
        o[hcap.key.Code.RES_2] = 614;
        o[hcap.key.Code.RES_3] = 615;
        o[hcap.key.Code.RES_4] = 616;
        o[hcap.key.Code.RES_5] = 617;
        o[hcap.key.Code.RES_6] = 618;
        o[hcap.key.Code.LOCK] = hcap.key.Code.LOCK;
        o[hcap.key.Code.SKIP] = hcap.key.Code.SKIP;
        o[hcap.key.Code.LIST] = 621;
        o[hcap.key.Code.LIVE] = hcap.key.Code.LIVE;
        o[hcap.key.Code.ON_DEMAND] = hcap.key.Code.ON_DEMAND;
        o[hcap.key.Code.PINP_MOVE] = hcap.key.Code.PINP_MOVE;
        o[hcap.key.Code.PINP_UP] = hcap.key.Code.PINP_UP;
        o[hcap.key.Code.PINP_DOWN] = hcap.key.Code.PINP_DOWN;
        o[hcap.key.Code.MENU] = 627;
        o[hcap.key.Code.AD] = hcap.key.Code.AD;
        o[hcap.key.Code.ALARM] = hcap.key.Code.ALARM;
        o[hcap.key.Code.AV_MODE] = 702;
        o[hcap.key.Code.SUBTITLE] = 726;
        o[hcap.key.Code.CC] = 703;
        o[hcap.key.Code.DISC_POWER_OFF] = hcap.key.Code.DISC_POWER_OFF;
        o[hcap.key.Code.DISC_POWER_ON] = hcap.key.Code.DISC_POWER_ON;
        o[hcap.key.Code.DVD] = hcap.key.Code.DVD;
        o[hcap.key.Code.EJECT] = 708;
        o[hcap.key.Code.ENERGY_SAVING] = hcap.key.Code.ENERGY_SAVING;
        o[hcap.key.Code.FAV] = hcap.key.Code.FAV;
        o[hcap.key.Code.FLASHBK] = hcap.key.Code.FLASHBK;
        o[hcap.key.Code.INPUT] = hcap.key.Code.INPUT;
        o[hcap.key.Code.MARK] = hcap.key.Code.MARK;
        o[hcap.key.Code.NETCAST] = 714;
        o[hcap.key.Code.PIP] = hcap.key.Code.PIP;
        o[hcap.key.Code.PIP_CH_DOWN] = hcap.key.Code.PIP_CH_DOWN;
        o[hcap.key.Code.PIP_CH_UP] = hcap.key.Code.PIP_CH_UP;
        o[hcap.key.Code.PIP_INPUT] = hcap.key.Code.PIP_INPUT;
        o[hcap.key.Code.PIP_SWAP] = hcap.key.Code.PIP_SWAP;
        o[hcap.key.Code.Q_MENU] = 720;
        o[hcap.key.Code.Q_VIEW] = 721;
        o[hcap.key.Code.RATIO] = 722;
        o[hcap.key.Code.SAP] = hcap.key.Code.SAP;
        o[hcap.key.Code.SIMPLINK] = hcap.key.Code.SIMPLINK;
        o[hcap.key.Code.STB] = hcap.key.Code.STB;
        o[hcap.key.Code.T_OPT] = 727;
        o[hcap.key.Code.TEXT] = 728;
        o[hcap.key.Code.SLEEP_TIMER] = hcap.key.Code.SLEEP_TIMER;
        o[hcap.key.Code.TV] = hcap.key.Code.TV;
        o[hcap.key.Code.TV_RAD] = hcap.key.Code.TV_RAD;
        o[hcap.key.Code.VCR] = hcap.key.Code.VCR;
        o[hcap.key.Code.POWER_LOWBATTERY] = hcap.key.Code.POWER_LOWBATTERY;
        o[hcap.key.Code.POWER] = hcap.key.Code.POWER;
        o[hcap.key.Code.ORDER] = hcap.key.Code.ORDER;
        o[hcap.key.Code.SMART_HOME] = hcap.key.Code.SMART_HOME;
        o[hcap.key.Code.SCREEN_REMOTE] = hcap.key.Code.SCREEN_REMOTE;
        o[hcap.key.Code.POINTER] = hcap.key.Code.POINTER;
        o[hcap.key.Code.LG_3D] = hcap.key.Code.LG_3D;
        hcap.key.addKeyItem = function(q) {
            q.virtualKeycode = o[q.virtualKeycode];
            j("add_key_item", q)
        };
        hcap.key.removeKeyItem = function(q) {
            j("remove_key_item", q)
        };
        hcap.key.clearKeyTable = function(q) {
            j("clear_key_table", q)
        };
        hcap.key.sendKey = function(q) {
            q.virtualKeycode = o[q.virtualKeycode];
            j("send_key", q)
        };
        hcap.mouse = {};
        hcap.mouse.isMouseVisible = function(q) {
            j("get_mouse_visible", q)
        };
        hcap.mouse.setMouseVisible = function(q) {
            j("set_mouse_visible", q)
        };
        hcap.property = {};
        hcap.property.PicturePropertyKey = {
            BACKLIGHT: 1,
            CONTRAST: 2,
            BRIGHTNESS: 3,
            SHARPNESS: 4,
            COLOR: 5,
            TINT: 6,
            COLOR_TEMPERATURE: 7,
            ASPECT_RATIO: 8
        };
        hcap.property.getPictureProperty = function(q) {
            j("get_picture_property", q)
        };
        hcap.property.setPictureProperty = function(q) {
            j("set_picture_property", q)
        };
        hcap.property.getProperty = function(q) {
            j("get_property", q)
        };
        hcap.property.setProperty = function(q) {
            j("set_property", q)
        };
        hcap.Media = function() {};
        var g = null;
        hcap.Media.startUp = function(q) {
            j("media_startup", q)
        };
        hcap.Media.shutDown = function(q) {
            j("media_shutdown", q)
        };
        hcap.Media.createMedia = function(q) {
            if (q === null) {
                return g
            } else {
                if (g === null && q.url !== null && q.mimeType !== null) {
                    g = new hcap.Media();
                    j("media_create_media", q);
                    return g
                }
            }
            return null
        };
        hcap.Media.prototype.play = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_play", q)
        };
        hcap.Media.prototype.pause = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_pause", q)
        };
        hcap.Media.prototype.resume = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_resume", q)
        };
        hcap.Media.prototype.stop = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_stop", q)
        };
        hcap.Media.prototype.destroy = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_destroy", q);
            g = null
        };
        hcap.Media.prototype.getInformation = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_get_information", q)
        };
        hcap.Media.prototype.getPlayPosition = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_get_play_position", q)
        };
        hcap.Media.prototype.setPlayPosition = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_set_play_position", q)
        };
        hcap.Media.prototype.getPlaySpeed = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_get_play_speed", q)
        };
        hcap.Media.prototype.setPlaySpeed = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_set_play_speed", q)
        };
        hcap.Media.prototype.setSubtitleOn = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_set_subtitle_on", q)
        };
        hcap.Media.prototype.getSubtitleOn = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_get_subtitle_on", q)
        };
        hcap.Media.prototype.setSubtitleUrl = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_set_subtitle_url", q)
        };
        hcap.Media.prototype.getState = function(q) {
            if (g === null) {
                q.onFailure({
                    errorMessage: "already destroyed."
                });
                return
            }
            j("media_get_state", q)
        };
        hcap.Media.prototype.getAudioLanguage = function(q) {
            j("media_get_audio_language", q)
        };
        hcap.Media.prototype.setAudioLanguage = function(q) {
            j("media_set_audio_language", q)
        };
        hcap.rms = {};
        hcap.rms.requestRms = function(q) {
            j("request_rms", q)
        };
        hcap.socket = {};
        hcap.socket.openUdpDaemon = function(q) {
            j("open_udp_daemon", q)
        };
        hcap.socket.closeUdpDaemon = function(q) {
            j("close_udp_daemon", q)
        };
        hcap.socket.openTcpDaemon = function(q) {
            j("open_tcp_daemon", q)
        };
        hcap.socket.closeTcpDaemon = function(q) {
            j("close_tcp_daemon", q)
        };
        hcap.socket.sendUdpData = function(q) {
            j("send_udp_data", q)
        };
        hcap.drm = {};
        hcap.drm.securemedia = {};
        hcap.drm.securemedia.initialize = function(q) {
            j("secure_media_drm_initialize", q)
        };
        hcap.drm.securemedia.unregister = function(q) {
            j("secure_media_drm_unregister", q)
        };
        hcap.drm.securemedia.isRegistration = function(q) {
            j("secure_media_drm_is_registration", q)
        };
        hcap.drm.securemedia.register = function(q) {
            j("secure_media_drm_register", q)
        };
        hcap.drm.securemedia.finalize = function(q) {
            j("secure_media_drm_finalize", q)
        }
    }())
}
trace( "end of hcap initialization" );
;