define(["vue", "MINT", "Util", "txt!../../pages/demo.html"],
    function(v, MINT, Util, demo) {

        var Demo = v.extend({

            template: demo,

            data: function(){
                return {
                    writingFlag: false,
                    colorFlag: false,
                    selectMacs: [],
                    currentRgb: "#ff0000",
                    currentWrite: -1,
                    timerNum: 0,
                    writeId: "",
                    marqueeId: "",
                    unMarqueeId: "",
                    colorList: ["#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#8000ff"],
                    cycleList: ["240ac48b9fd0", "240ac48b8e60", "240ac48b94bc", "240ac48b8f9c", "240ac48b965c",
                        "240ac48b8e30", "240ac48b91d0", "240ac48b94d0", "240ac48b8e40", "240ac48b9aa8", "240ac48ba2bc",
                        "240ac48b8b78", "240ac48b8ee4", "240ac48ba288", "240ac48b90e4", "240ac48b9e6c",
                        "240ac48b9028", "240ac48b91bc", "240ac48ba0ec", "240ac48b9af0", "240ac48b916c", "240ac48b93c8",
                        "240ac48ba558", "240ac48b91a8", "240ac48b92c0", "240ac48b963c", "240ac48b9d1c", "240ac48b8e38",
                        "240ac48b9234", "240ac48ba618", "240ac48b9058", "240ac48b9988", "240ac48b9dc4", "240ac48ba310",
                        "240ac48b9600", "30aea457d5ec", "30aea457d52c", "240ac48b97bc", "240ac48ba108", "30aea457d724",
                        "240ac48b9240", "240ac48ba500", "240ac48b87a8", "240ac48b9c2c", "240ac48ba0e0","240ac48b870c",
                        "240ac48b9204", "240ac48b94f8", "240ac48b8924", "240ac48b9bf4", "240ac48b8d80", "240ac48b980c",
                        "240ac48b988c", "240ac48b8950", "240ac48b97c0", "240ac48b8954", "240ac48ba3c8", "30aea457d340",
                        "240ac48ba24c", "240ac48b9e54","240ac48b9a30", "240ac48b98e8", "240ac48ba4f4", "240ac48b87c8",
                        "240ac48b8f88", "30aea457d59c", "240ac48b9b54", "240ac48b935c", "240ac48ba334", "240ac48b8714",
                        "240ac48b9390", "30aea457d5f4", "240ac48b8cf8", "240ac48b91a4", "240ac48b9d44", "240ac48b93c4",
                        "240ac48b8f40", "240ac48b912c", "30aea457d578", "30aea457d510", "240ac48b9be0", "240ac48b8ab4",
                        "240ac48ba580", "240ac48b910c", "240ac48b8f7c", "240ac48ba3dc", "30aea457d61c", "240ac48ba530",
                        "240ac48b8dfc", "240ac48b9270", "240ac48b8f24", "240ac48b9594", "240ac48b9fa4", "240ac48b8d08",
                        "240ac48b9f68", "240ac48ba120", "240ac48b9c1c", "30aea457d6c0", "240ac48b9110", "240ac48b9344",
                        "240ac48b97a4", "240ac48ba5b8", "240ac48ba4c8", "240ac48b87f8", "30aea457d54c", "240ac48ba2dc",
                        "240ac48b98e0", "240ac48b9660", "240ac48b8fa8", "240ac48b9cb4", "30aea457d588", "240ac48ba454",
                        "240ac48b96a8", "240ac48ba3fc", "240ac48b8a9c", "240ac48ba188", "240ac48ba180", "30aea457d47c",
                        "240ac48b98c4", "240ac48b8dc0", "240ac48b9878", "240ac48b8b30", "240ac48b97d8", "240ac48ba4d0",
                        "240ac48ba148", "240ac48b9604", "240ac48b8e64", "30aea457d5c4", "240ac48b8c00", "240ac48b9978",
                        "240ac48b8b9c", "240ac48b8e78", "240ac48b99d8", "30aea457d544", "240ac48b946c", "240ac48ba534",
                        "240ac48ba484", "240ac48b9f5c", "240ac48b91dc", "240ac48b8c2c", "240ac48ba0d0", "30aea457d610",
                        "240ac48b9d18", "240ac48b886c", "240ac48ba1f4", "240ac48b8738", "240ac48b8838", "240ac48b9038",
                        "240ac48b8710", "240ac48b9258", "240ac48ba42c", "240ac48b8ee0", "240ac48b9488", "240ac48b8c5c",
                        "240ac48b9250", "240ac48b97d4", "240ac48b92e0", "240ac48ba4e4", "240ac48b8c48", "240ac48b8bf4",
                        "240ac48b8a30", "240ac48b90ac", "240ac48ba2ac", "240ac48b8ea4", "240ac48ba4b8", "240ac48b92a0",
                        "240ac48b8844", "240ac48b9158", "240ac48b8cd0", "240ac48ba1b0", "30aea457d480", "240ac48ba3b4",
                        "240ac48b987c", "240ac48b961c", "240ac48b9a94", "240ac48b8e00", "240ac48ba2e4", "30aea457d680",
                        "240ac48b9ee8", "240ac48ba400", "240ac48ba3d8", "240ac48b8dac", "240ac48b917c", "240ac48b9414",
                        "240ac48b87a4", "240ac48b9f38", "240ac48b9440", "240ac48b8d74", "240ac48b8e5c", "240ac48b9ff8",
                        "240ac48b8f70", "240ac48b90e0", "240ac48b9eb4", "240ac48b9bf0", "240ac48b9468", "240ac48b8858",
                        "240ac48b945c", "240ac48b96c8", "240ac48b8a60", "240ac48ba4cc", "240ac48b8c8c", "30aea457d600",
                        "240ac48b9d84", "240ac48b9338", "240ac48b8cbc", "240ac48b98b0", "240ac48b90c8", "240ac48b8c24",
                        "240ac48b9f70", "240ac48b893c", "240ac48ba008", "240ac48ba190", "240ac48b8c54","30aea457d3d8",
                        "30aea457d2f0", "240ac48b9a84", "240ac48b8940", "240ac48b8930", "240ac48b9084", "240ac48b97e4",
                        "240ac48b8c44", "240ac48b9194", "240ac48b98fc", "240ac48ba3a0", "240ac48b9854", "240ac48b9470",
                        "240ac48b8cd4", "30aea457d5f8", "240ac48b8fc4", "240ac48b9220", "240ac48b9238", "240ac48b9fb4",
                        "240ac48b9e5c", "240ac48b8b58", "240ac48ba0d4", "240ac48ba014", "240ac48b8ebc", "240ac48b9690",
                        "240ac48b8b44", "240ac48b978c", "240ac48b9a90", "240ac48b8ef0", "30aea457d594", "240ac48b9684",
                        "240ac48ba428", "240ac48b8efc", "240ac48b99a4", "240ac48b9f8c", "240ac48b9724", "240ac48b8f78",
                        "240ac48b8a20", "240ac48b8bc4", "240ac48ba184", "240ac48b97a0", "240ac48b94a0", "240ac48b9d0c"
                    ],
                    trList0: ["240ac48b9fd0", "240ac48b8e60", "240ac48b94bc", "240ac48b8f9c", "240ac48b965c",
                        "240ac48b8e30", "240ac48b91d0", "240ac48b94d0", "240ac48b8e40", "240ac48b9aa8", "240ac48ba2bc",
                        "240ac48b8b78", "240ac48b8ee4", "240ac48ba288", "240ac48b90e4", "240ac48b9e6c"],
                    trList1: ["240ac48b9e54","240ac48b9a30", "240ac48b98e8", "240ac48ba4f4", "240ac48b87c8", "240ac48b8f88",
                        "30aea457d59c", "240ac48b9b54", "240ac48b935c", "240ac48ba334", "240ac48b8714", "240ac48b9390",
                        "30aea457d5f4", "240ac48b8cf8", "240ac48b91a4", "240ac48b9028"],
                    trList2: ["240ac48ba24c", "240ac48ba454", "240ac48b96a8",
                        "240ac48ba3fc", "240ac48b8a9c", "240ac48ba188", "240ac48ba180", "30aea457d47c", "240ac48b98c4",
                        "240ac48b8dc0", "240ac48b9878", "240ac48b8b30", "240ac48b97d8", "240ac48ba4d0", "240ac48b9d44",
                        "240ac48b91bc"],
                    trList3: ["30aea457d340", "30aea457d588", "240ac48b97d4", "240ac48b92e0", "240ac48ba4e4",
                        "240ac48b8c48", "240ac48b8bf4", "240ac48b8a30", "240ac48b90ac", "240ac48ba2ac", "240ac48b8ea4",
                        "240ac48ba4b8", "240ac48b92a0", "240ac48ba148", "240ac48b93c4", "240ac48ba0ec"],
                    trList4: ["240ac48ba3c8",
                        "240ac48b9cb4", "240ac48b9250", "240ac48b90e0", "240ac48b9eb4", "240ac48b9bf0", "240ac48b9468",
                        "240ac48b8858", "240ac48b945c", "240ac48b96c8", "240ac48b8a60", "240ac48ba4cc", "240ac48b8844",
                        "240ac48b9604", "240ac48b8f40", "240ac48b9af0"],
                    trList5: ["240ac48b8954", "240ac48b8fa8", "240ac48b8c5c",
                        "240ac48b8f70", "240ac48b97e4", "240ac48b8c44", "240ac48b9194", "240ac48b98fc", "240ac48ba3a0",
                        "240ac48b9854", "240ac48b9470", "240ac48b8c8c", "240ac48b9158", "240ac48b8e64", "240ac48b912c",
                        "240ac48b916c"],
                    trList6: ["240ac48b97c0", "240ac48b9660", "240ac48b9488", "240ac48b9ff8", "240ac48b9084",
                        "240ac48b978c", "240ac48b9a90", "240ac48b8ef0", "30aea457d594", "240ac48b9684", "240ac48b8cd4",
                        "30aea457d600", "240ac48b8cd0", "30aea457d5c4", "30aea457d578", "240ac48b93c8"],
                    trList7: ["240ac48b8950",
                        "240ac48b98e0", "240ac48b8ee0", "240ac48b8e5c", "240ac48b8930", "240ac48b8b44", "240ac48b8bc4",
                        "240ac48ba184", "240ac48b97a0", "240ac48ba428", "30aea457d5f8", "240ac48b9d84", "240ac48ba1b0",
                        "240ac48b8c00", "30aea457d510", "240ac48ba558"],
                    trList8: ["240ac48b988c", "240ac48ba2dc", "240ac48ba42c",
                        "240ac48b8d74", "240ac48b8940", "240ac48b9690", "240ac48b8a20", "240ac48b9d0c", "240ac48b94a0",
                        "240ac48b8efc", "240ac48b8fc4", "240ac48b9338", "30aea457d480", "240ac48b9978", "240ac48b9be0",
                        "240ac48b91a8"],
                    trList9: ["240ac48b980c", "30aea457d54c", "240ac48b9258", "240ac48b9440", "240ac48b9a84",
                        "240ac48b8ebc", "240ac48b8f78", "240ac48b9724", "240ac48b9f8c", "240ac48b99a4", "240ac48b9220",
                        "240ac48b8cbc", "240ac48ba3b4", "240ac48b8b9c", "240ac48b8ab4", "240ac48b92c0"],
                    trList10: ["240ac48b8d80",
                        "240ac48b87f8", "240ac48b8710", "240ac48b9f38", "30aea457d2f0", "240ac48ba014", "240ac48ba0d4",
                        "240ac48b8b58", "240ac48b9e5c", "240ac48b9fb4", "240ac48b9238", "240ac48b98b0", "240ac48b987c",
                        "240ac48b8e78", "240ac48ba580", "240ac48b963c"],
                    trList11: ["240ac48b9bf4", "240ac48ba4c8", "240ac48b9038",
                        "240ac48b87a4", "30aea457d3d8", "240ac48b8c54", "240ac48ba190", "240ac48ba008", "240ac48b893c",
                        "240ac48b9f70", "240ac48b8c24", "240ac48b90c8", "240ac48b961c", "240ac48b99d8", "240ac48b910c",
                        "240ac48b9d1c"],
                    trList12: ["240ac48b8924", "240ac48ba5b8", "240ac48b8838", "240ac48b9414", "240ac48b917c",
                        "240ac48b8dac", "240ac48ba3d8", "240ac48ba400", "240ac48b9ee8", "30aea457d680", "240ac48ba2e4",
                        "240ac48b8e00", "240ac48b9a94", "30aea457d544", "240ac48b8f7c", "240ac48b8e38"],
                    trList13: ["240ac48b94f8",
                        "240ac48b97a4", "240ac48b8738", "240ac48ba1f4", "240ac48b886c", "240ac48b9d18", "30aea457d610",
                        "240ac48ba0d0", "240ac48b8c2c", "240ac48b91dc", "240ac48b9f5c", "240ac48ba484", "240ac48ba534",
                        "240ac48b946c", "240ac48ba3dc", "240ac48b9234"],
                    trList14: ["240ac48b9204", "240ac48b9344", "240ac48b9110",
                        "30aea457d6c0", "240ac48b9c1c", "240ac48ba120", "240ac48b9f68", "240ac48b8d08", "240ac48b9fa4",
                        "240ac48b9594", "240ac48b8f24", "240ac48b9270", "240ac48b8dfc", "240ac48ba530", "30aea457d61c",
                        "240ac48ba618"],
                    trList15: ["240ac48b870c", "240ac48ba0e0", "240ac48b9c2c", "240ac48b87a8", "240ac48ba500",
                        "240ac48b9240", "30aea457d724", "240ac48ba108", "240ac48b97bc", "30aea457d52c", "30aea457d5ec",
                        "240ac48b9600", "240ac48ba310", "240ac48b9dc4", "240ac48b9988", "240ac48b9058"],
                    twoList: ["240ac48b94d0","240ac48b8f88","30aea457d59c","240ac48b935c","240ac48ba334","240ac48ba3fc",
                        "240ac48b8a9c","240ac48b9878","240ac48b8b30","30aea457d340","30aea457d588","240ac48b97d4",
                        "240ac48ba4e4","240ac48b8c48","240ac48b8bf4","240ac48b8a30","240ac48b90ac","240ac48ba2ac",
                        "240ac48b8ea4","240ac48b92a0","240ac48ba148","240ac48b93c4","240ac48b8858","240ac48b8f70",
                        "240ac48b97e4","240ac48b8c44","240ac48b9194","240ac48b98fc","240ac48ba3a0","240ac48b9854",
                        "240ac48b9470","240ac48b8c8c","240ac48b978c","240ac48b8ef0","240ac48b9684","240ac48b8ee0",
                        "240ac48b8e5c","240ac48b8930","240ac48b8b44","240ac48b8bc4","240ac48ba184","240ac48b97a0",
                        "240ac48ba428","30aea457d5f8","240ac48b9d84","240ac48ba1b0","240ac48b8d74","240ac48b9338",
                        "240ac48b9258","240ac48b9a84","240ac48b9220","240ac48ba3b4","240ac48b87f8","240ac48b8710",
                        "240ac48b9f38","30aea457d2f0","240ac48ba014","240ac48b9fb4","240ac48b9238","240ac48b98b0",
                        "240ac48b987c","240ac48b8e78","240ac48b9bf4","240ac48b87a4","240ac48ba190",
                        "240ac48b893c","240ac48b90c8","240ac48b910c","240ac48ba5b8","240ac48b8838","240ac48b9414",
                        "240ac48b917c","240ac48b8dac","240ac48ba2e4","240ac48b8e00","240ac48b9a94","240ac48ba1f4",
                        "240ac48ba484","240ac48b9344","30aea457d6c0","240ac48ba120","240ac48b9594","240ac48b9270",
                        "240ac48ba530","240ac48b870c","240ac48ba0e0","240ac48b9c2c","240ac48b87a8","240ac48ba500",
                        "240ac48b9240","30aea457d724","240ac48b97bc","30aea457d52c","30aea457d5ec","240ac48b9600",
                        "240ac48ba310","240ac48b9dc4","240ac48b9988"],
                    oneList: ["240ac48ba2bc","240ac48b935c","240ac48ba334","240ac48b8714","240ac48b9390","240ac48ba3fc",
                        "240ac48b8a9c","240ac48ba188","240ac48ba180","30aea457d47c","240ac48b92e0","240ac48b90e0",
                        "240ac48b8858","240ac48b8f70","240ac48b98fc","240ac48b9488","240ac48b8ef0","240ac48b98e0",
                        "240ac48b8ee0","240ac48b8e5c","240ac48b8930","240ac48b8b44","240ac48b8bc4","240ac48ba184",
                        "240ac48b97a0","240ac48ba428","30aea457d5f8","240ac48b9d84","240ac48ba1b0","240ac48b8c00",
                        "240ac48b9d0c","240ac48b9724","240ac48b8b58","240ac48b9238","240ac48b90c8","240ac48b9414",
                        "240ac48ba400","240ac48b9a94","240ac48b8738","240ac48ba0d0","240ac48ba534","240ac48b946c",
                        "240ac48b9344","240ac48ba120","240ac48b8d08","240ac48ba530","30aea457d724", "240ac48b87a4",
                         "240ac48ba008", "240ac48b9f38"],
                    threeList: ["240ac48b8e40","240ac48b935c","240ac48ba24c","240ac48ba454","240ac48b96a8","240ac48ba3fc",
                        "240ac48b8a9c","240ac48ba188","240ac48b98c4","240ac48b8c48","240ac48b90ac","240ac48ba2ac",
                        "240ac48b8ea4","240ac48ba4b8","240ac48b92a0","240ac48ba148","240ac48b9cb4","240ac48b9bf0",
                        "240ac48b8858","240ac48b9604","240ac48b8fa8","240ac48b8c44","240ac48b9194","240ac48b9854",
                        "240ac48b9158","240ac48b9488","240ac48b9084","240ac48b9684","240ac48b8ee0","240ac48b8930",
                        "240ac48ba428","240ac48b8d74","240ac48b8efc","240ac48b9258","240ac48b9a84","240ac48b99a4",
                        "240ac48b8710","240ac48ba014","240ac48b9e5c","240ac48b9238","240ac48ba4c8","240ac48b8c54",
                        "240ac48b893c","240ac48b8c24","240ac48b8924","240ac48ba400","240ac48b8e00","240ac48ba0d0",
                        "240ac48ba534","240ac48b9f68","240ac48b8dfc","240ac48ba530","30aea457d61c","240ac48ba500",
                        "240ac48b9240","240ac48b9dc4"],
                    fourList: ["240ac48b9a30","240ac48b9b54","240ac48b935c","240ac48b8cf8","240ac48b96a8","240ac48ba188",
                        "240ac48ba180","240ac48b8dc0","240ac48b9878","240ac48b8b30","240ac48b97d8","240ac48ba4d0",
                        "240ac48b9d44","240ac48b92e0","240ac48b8c48","240ac48ba2ac","240ac48ba148","240ac48b9bf0",
                        "240ac48b96c8","240ac48b9604","240ac48b8c44","240ac48b9854","240ac48b8e64","240ac48b97c0",
                        "240ac48b9660","240ac48b9488","240ac48b9ff8","240ac48b978c","240ac48b9684","30aea457d5c4",
                        "240ac48b8e5c","240ac48b8b44","240ac48b97a0","240ac48ba428","240ac48b8c00","240ac48b8d74",
                        "240ac48b9690","240ac48b9d0c","240ac48b8efc","240ac48b9978","240ac48b9440","240ac48b8ebc",
                        "240ac48b8f78","240ac48b99a4","240ac48b8cbc","240ac48b8b9c","240ac48b9f38","240ac48ba014",
                        "240ac48b9fb4","240ac48b987c","240ac48b87a4","240ac48b9f70","240ac48b9414","30aea457d680",
                        "240ac48b8738","240ac48b886c","240ac48b91dc","240ac48b946c","240ac48ba3dc","240ac48b9344",
                        "240ac48ba120","240ac48b9f68","240ac48b8d08","240ac48b9fa4","240ac48b9594","240ac48b8f24",
                        "240ac48b9270","240ac48b8dfc","240ac48ba530"],
                    fiveList: ["240ac48b965c","240ac48b94d0","240ac48b87c8","240ac48b9b54","240ac48ba3fc","240ac48ba180",
                        "30aea457d47c","240ac48b98c4","240ac48b8dc0","240ac48b9878","240ac48b8b30","240ac48b97d8",
                        "240ac48ba4d0","240ac48b92e0","240ac48b8bf4","240ac48ba2ac","240ac48ba148","240ac48b9250",
                        "240ac48b90e0","240ac48b9bf0","240ac48b96c8","240ac48b8844","240ac48b8fa8","240ac48b8f70",
                        "240ac48b97e4","240ac48b98fc","240ac48b9854","240ac48b97c0","240ac48b9ff8","240ac48b8ef0",
                        "240ac48b9684","30aea457d600","240ac48b8e5c","240ac48b8bc4","240ac48ba428","240ac48ba1b0",
                        "240ac48b8c00","240ac48b8d74","240ac48b9690","240ac48b8efc","240ac48b9978","240ac48b9440",
                        "240ac48b9724","240ac48b99a4","240ac48b9f38","240ac48b9e5c","240ac48ba190","240ac48ba5b8",
                        "240ac48b9414","240ac48ba400","240ac48b9ee8","30aea457d544","240ac48b97a4","240ac48ba1f4",
                        "240ac48b8c2c","240ac48ba484","240ac48ba3dc","240ac48b9204","30aea457d6c0","240ac48b9270",
                        "30aea457d61c","240ac48ba500","240ac48b9240","30aea457d724","240ac48ba108","240ac48b97bc",
                        "30aea457d52c","30aea457d5ec","240ac48b9600"],
                    verticalList0: ["240ac48b9fd0", "240ac48b9e54", "240ac48ba24c", "30aea457d340", "240ac48ba3c8",
                        "240ac48b8954", "240ac48b97c0", "240ac48b8950", "240ac48b988c", "240ac48b980c", "240ac48b8d80",
                        "240ac48b9bf4", "240ac48b8924", "240ac48b94f8", "240ac48b9204", "240ac48b870c"],
                    verticalList1: ["240ac48b8e60", "240ac48b9a30", "240ac48ba454", "30aea457d588", "240ac48b9cb4",
                        "240ac48b8fa8", "240ac48b9660", "240ac48b98e0", "240ac48ba2dc", "30aea457d54c", "240ac48b87f8",
                        "240ac48ba4c8", "240ac48ba5b8", "240ac48b97a4", "240ac48b9344", "240ac48ba0e0"],
                    verticalList2: ["240ac48b94bc", "240ac48b98e8", "240ac48b96a8", "240ac48b97d4", "240ac48b9250",
                        "240ac48b8c5c", "240ac48b9488", "240ac48b8ee0", "240ac48ba42c", "240ac48b9258", "240ac48b8710",
                        "240ac48b9038", "240ac48b8838", "240ac48b8738", "240ac48b9110", "240ac48b9c2c"],
                    verticalList3: ["240ac48b8f9c", "240ac48ba4f4", "240ac48ba3fc", "240ac48b92e0", "240ac48b90e0",
                        "240ac48b8f70", "240ac48b9ff8", "240ac48b8e5c", "240ac48b8d74", "240ac48b9440", "240ac48b9f38",
                        "240ac48b87a4", "240ac48b9414", "240ac48ba1f4", "30aea457d6c0", "240ac48b87a8"],
                    verticalList4: ["240ac48b965c", "240ac48b87c8", "240ac48b8a9c", "240ac48ba4e4", "240ac48b9eb4",
                        "240ac48b97e4", "240ac48b9084", "240ac48b8930", "240ac48b8940", "240ac48b9a84", "30aea457d2f0",
                        "30aea457d3d8", "240ac48b917c", "240ac48b886c", "240ac48b9c1c", "240ac48ba500"],
                    verticalList5: ["240ac48b8e30", "240ac48b8f88", "240ac48ba188", "240ac48b8c48", "240ac48b9bf0",
                        "240ac48b8c44", "240ac48b978c", "240ac48b8b44", "240ac48b9690", "240ac48b8ebc", "240ac48ba014",
                        "240ac48b8c54", "240ac48b8dac", "240ac48b9d18", "240ac48ba120", "240ac48b9240"],
                    verticalList6: ["240ac48b91d0", "30aea457d59c", "240ac48ba180", "240ac48b8bf4", "240ac48b9468",
                        "240ac48b9194", "240ac48b9a90", "240ac48b8bc4", "240ac48b8a20", "240ac48b8f78", "240ac48ba0d4",
                        "240ac48ba190", "240ac48ba3d8", "30aea457d610", "240ac48b9f68", "30aea457d724"],
                    verticalList7: ["240ac48b94d0", "240ac48b9b54", "30aea457d47c", "240ac48b8a30", "240ac48b8858",
                        "240ac48b98fc", "240ac48b8ef0", "240ac48ba184", "240ac48b9d0c", "240ac48b9724", "240ac48b8b58",
                        "240ac48ba008", "240ac48ba400", "240ac48ba0d0", "240ac48b8d08", "240ac48ba108"],
                    verticalList8: ["240ac48b8e40", "240ac48b935c", "240ac48b98c4", "240ac48b90ac", "240ac48b945c",
                        "240ac48ba3a0", "30aea457d594", "240ac48b97a0", "240ac48b94a0", "240ac48b9f8c", "240ac48b9e5c",
                        "240ac48b893c", "240ac48b9ee8", "240ac48b8c2c", "240ac48b9fa4", "240ac48b97bc"],
                    verticalList9: ["240ac48b9aa8", "240ac48ba334", "240ac48b8dc0", "240ac48ba2ac", "240ac48b96c8",
                        "240ac48b9854", "240ac48b9684", "240ac48ba428", "240ac48b8efc", "240ac48b99a4", "240ac48b9fb4",
                        "240ac48b9f70", "30aea457d680", "240ac48b91dc", "240ac48b9594", "30aea457d52c"],
                    verticalList10: ["240ac48ba2bc", "240ac48b8714", "240ac48b9878", "240ac48b8ea4", "240ac48b8a60",
                        "240ac48b9470", "240ac48b8cd4", "30aea457d5f8", "240ac48b8fc4", "240ac48b9220", "240ac48b9238",
                        "240ac48b8c24", "240ac48ba2e4", "240ac48b9f5c", "240ac48b8f24", "30aea457d5ec"],
                    verticalList11: ["240ac48b8b78", "240ac48b9390", "240ac48b8b30", "240ac48ba4b8", "240ac48ba4cc",
                        "240ac48b8c8c", "30aea457d600", "240ac48b9d84", "240ac48b9338", "240ac48b8cbc", "240ac48b98b0",
                        "240ac48b90c8", "240ac48b8e00", "240ac48ba484", "240ac48b9270", "240ac48b9600"],
                    verticalList12: ["240ac48b8ee4", "30aea457d5f4", "240ac48b97d8", "240ac48b92a0", "240ac48b8844",
                        "240ac48b9158", "240ac48b8cd0", "240ac48ba1b0", "30aea457d480", "240ac48ba3b4", "240ac48b987c",
                        "240ac48b961c", "240ac48b9a94", "240ac48ba534", "240ac48b8dfc", "240ac48ba310"],
                    verticalList13: ["240ac48ba288", "240ac48b8cf8", "240ac48ba4d0", "240ac48ba148", "240ac48b9604",
                        "240ac48b8e64", "30aea457d5c4", "240ac48b8c00", "240ac48b9978", "240ac48b8b9c", "240ac48b8e78",
                        "240ac48b99d8", "30aea457d544", "240ac48b946c", "240ac48ba530", "240ac48b9dc4"],
                    verticalList14: ["240ac48b90e4", "240ac48b91a4", "240ac48b9d44", "240ac48b93c4", "240ac48b8f40",
                        "240ac48b912c", "30aea457d578", "30aea457d510", "240ac48b9be0", "240ac48b8ab4", "240ac48ba580",
                        "240ac48b910c", "240ac48b8f7c", "240ac48ba3dc", "30aea457d61c", "240ac48b9988"],
                    verticalList15: ["240ac48b9e6c", "240ac48b9028", "240ac48b91bc", "240ac48ba0ec", "240ac48b9af0",
                        "240ac48b916c", "240ac48b93c8", "240ac48ba558", "240ac48b91a8", "240ac48b92c0", "240ac48b963c",
                        "240ac48b9d1c", "240ac48b8e38", "240ac48b9234", "240ac48ba618", "240ac48b9058"],
                    espList: ["240ac48b9eb4", "240ac48b90e0", "240ac48b9250", "240ac48b9cb4", "240ac48b8fa8",
                        "240ac48b9660", "240ac48b98e0", "240ac48ba2dc", "30aea457d54c", "240ac48b87f8", "240ac48ba4c8",
                        "240ac48ba5b8", "240ac48b8838", "240ac48b9414", "240ac48b917c", "240ac48b9854", "240ac48b945c",
                        "240ac48b8858", "240ac48b9194", "240ac48b9a90", "240ac48b8bc4", "240ac48b9d0c", "240ac48b94a0",
                        "240ac48b99a4", "240ac48b9fb4", "240ac48b9f70", "240ac48b9ee8", "240ac48ba400", "240ac48ba190",
                        "240ac48ba4cc", "240ac48b8c8c", "30aea457d600", "240ac48b9338", "240ac48b8cbc", "240ac48b98b0",
                        "240ac48b90c8", "240ac48b8e00", "240ac48b8844", "240ac48b9604", "240ac48b912c", "30aea457d578",
                        "30aea457d510", "240ac48b9978", "30aea457d480", "240ac48ba42c", "240ac48b8d74", "240ac48b8940"],
                    snakeList: [
                        ["240ac48b9fd0", "240ac48b8e60", "240ac48b94bc", "240ac48b8f9c", "240ac48b965c","240ac48b8e30",
                            "240ac48b91d0", "240ac48b94d0", "240ac48b8e40", "240ac48b9aa8", "240ac48ba2bc","240ac48b8b78",
                            "240ac48b8ee4", "240ac48ba288", "240ac48b90e4", "240ac48b9e6c"],
                        ["240ac48b9e54","240ac48b9a30", "240ac48b98e8", "240ac48ba4f4", "240ac48b87c8", "240ac48b8f88",
                            "30aea457d59c", "240ac48b9b54", "240ac48b935c", "240ac48ba334", "240ac48b8714", "240ac48b9390",
                            "30aea457d5f4", "240ac48b8cf8", "240ac48b91a4", "240ac48b9028"],
                        ["240ac48ba24c", "240ac48ba454", "240ac48b96a8", "240ac48ba3fc", "240ac48b8a9c", "240ac48ba188",
                            "240ac48ba180", "30aea457d47c", "240ac48b98c4", "240ac48b8dc0", "240ac48b9878", "240ac48b8b30",
                            "240ac48b97d8", "240ac48ba4d0", "240ac48b9d44", "240ac48b91bc"],
                        ["30aea457d340", "30aea457d588", "240ac48b97d4", "240ac48b92e0", "240ac48ba4e4", "240ac48b8c48",
                            "240ac48b8bf4", "240ac48b8a30", "240ac48b90ac", "240ac48ba2ac", "240ac48b8ea4", "240ac48ba4b8",
                            "240ac48b92a0", "240ac48ba148", "240ac48b93c4", "240ac48ba0ec"],
                        ["240ac48ba3c8", "240ac48b9cb4", "240ac48b9250", "240ac48b90e0", "240ac48b9eb4", "240ac48b9bf0",
                            "240ac48b9468", "240ac48b8858", "240ac48b945c", "240ac48b96c8", "240ac48b8a60", "240ac48ba4cc",
                            "240ac48b8844", "240ac48b9604", "240ac48b8f40", "240ac48b9af0"],
                        ["240ac48b8954", "240ac48b8fa8", "240ac48b8c5c", "240ac48b8f70", "240ac48b97e4", "240ac48b8c44",
                            "240ac48b9194", "240ac48b98fc", "240ac48ba3a0", "240ac48b9854", "240ac48b9470", "240ac48b8c8c",
                            "240ac48b9158", "240ac48b8e64", "240ac48b912c", "240ac48b916c"],
                        ["240ac48b97c0", "240ac48b9660", "240ac48b9488", "240ac48b9ff8", "240ac48b9084", "240ac48b978c",
                            "240ac48b9a90", "240ac48b8ef0", "30aea457d594", "240ac48b9684", "240ac48b8cd4", "30aea457d600",
                            "240ac48b8cd0", "30aea457d5c4", "30aea457d578", "240ac48b93c8"],
                        ["240ac48b8950", "240ac48b98e0", "240ac48b8ee0", "240ac48b8e5c", "240ac48b8930", "240ac48b8b44",
                            "240ac48b8bc4", "240ac48ba184", "240ac48b97a0", "240ac48ba428", "30aea457d5f8", "240ac48b9d84",
                            "240ac48ba1b0", "240ac48b8c00", "30aea457d510", "240ac48ba558"],
                        ["240ac48b988c", "240ac48ba2dc", "240ac48ba42c", "240ac48b8d74", "240ac48b8940", "240ac48b9690",
                            "240ac48b8a20", "240ac48b9d0c", "240ac48b94a0", "240ac48b8efc", "240ac48b8fc4", "240ac48b9338",
                            "30aea457d480", "240ac48b9978", "240ac48b9be0", "240ac48b91a8"],
                        ["240ac48b980c", "30aea457d54c", "240ac48b9258", "240ac48b9440", "240ac48b9a84", "240ac48b8ebc",
                            "240ac48b8f78", "240ac48b9724", "240ac48b9f8c", "240ac48b99a4", "240ac48b9220", "240ac48b8cbc",
                            "240ac48ba3b4", "240ac48b8b9c", "240ac48b8ab4", "240ac48b92c0"],
                        ["240ac48b8d80", "240ac48b87f8", "240ac48b8710", "240ac48b9f38", "30aea457d2f0", "240ac48ba014",
                            "240ac48ba0d4", "240ac48b8b58", "240ac48b9e5c", "240ac48b9fb4", "240ac48b9238", "240ac48b98b0",
                            "240ac48b987c", "240ac48b8e78", "240ac48ba580", "240ac48b963c"],
                        ["240ac48b9bf4", "240ac48ba4c8", "240ac48b9038", "240ac48b87a4", "30aea457d3d8", "240ac48b8c54",
                            "240ac48ba190", "240ac48ba008", "240ac48b893c", "240ac48b9f70", "240ac48b8c24", "240ac48b90c8",
                            "240ac48b961c", "240ac48b99d8", "240ac48b910c", "240ac48b9d1c"],
                        ["240ac48b8924", "240ac48ba5b8", "240ac48b8838", "240ac48b9414", "240ac48b917c", "240ac48b8dac",
                            "240ac48ba3d8", "240ac48ba400", "240ac48b9ee8", "30aea457d680", "240ac48ba2e4", "240ac48b8e00",
                            "240ac48b9a94", "30aea457d544", "240ac48b8f7c", "240ac48b8e38"],
                        ["240ac48b94f8", "240ac48b97a4", "240ac48b8738", "240ac48ba1f4", "240ac48b886c", "240ac48b9d18",
                            "30aea457d610", "240ac48ba0d0", "240ac48b8c2c", "240ac48b91dc", "240ac48b9f5c", "240ac48ba484",
                            "240ac48ba534", "240ac48b946c", "240ac48ba3dc", "240ac48b9234"],
                        ["240ac48b9204", "240ac48b9344", "240ac48b9110", "30aea457d6c0", "240ac48b9c1c", "240ac48ba120",
                            "240ac48b9f68", "240ac48b8d08", "240ac48b9fa4", "240ac48b9594", "240ac48b8f24", "240ac48b9270",
                            "240ac48b8dfc", "240ac48ba530", "30aea457d61c", "240ac48ba618"],
                        ["240ac48b870c", "240ac48ba0e0", "240ac48b9c2c", "240ac48b87a8", "240ac48ba500", "240ac48b9240",
                            "30aea457d724", "240ac48ba108", "240ac48b97bc", "30aea457d52c", "30aea457d5ec", "240ac48b9600",
                            "240ac48ba310", "240ac48b9dc4", "240ac48b9988", "240ac48b9058"],
                    ],
                    squareList: [
                        ["240ac48b9fd0", "240ac48b9e54", "240ac48ba24c", "30aea457d340", "240ac48ba3c8",
                            "240ac48b8954", "240ac48b97c0", "240ac48b8950", "240ac48b988c", "240ac48b980c", "240ac48b8d80",
                            "240ac48b9bf4", "240ac48b8924", "240ac48b94f8", "240ac48b9204", "240ac48b870c"],
                        ["240ac48b8e60", "240ac48b9a30", "240ac48ba454", "30aea457d588", "240ac48b9cb4",
                            "240ac48b8fa8", "240ac48b9660", "240ac48b98e0", "240ac48ba2dc", "30aea457d54c", "240ac48b87f8",
                            "240ac48ba4c8", "240ac48ba5b8", "240ac48b97a4", "240ac48b9344", "240ac48ba0e0"],
                        ["240ac48b94bc", "240ac48b98e8", "240ac48b96a8", "240ac48b97d4", "240ac48b9250",
                            "240ac48b8c5c", "240ac48b9488", "240ac48b8ee0", "240ac48ba42c", "240ac48b9258", "240ac48b8710",
                            "240ac48b9038", "240ac48b8838", "240ac48b8738", "240ac48b9110", "240ac48b9c2c"],
                        ["240ac48b8f9c", "240ac48ba4f4", "240ac48ba3fc", "240ac48b92e0", "240ac48b90e0",
                            "240ac48b8f70", "240ac48b9ff8", "240ac48b8e5c", "240ac48b8d74", "240ac48b9440", "240ac48b9f38",
                            "240ac48b87a4", "240ac48b9414", "240ac48ba1f4", "30aea457d6c0", "240ac48b87a8"],
                        ["240ac48b965c", "240ac48b87c8", "240ac48b8a9c", "240ac48ba4e4", "240ac48b9eb4",
                            "240ac48b97e4", "240ac48b9084", "240ac48b8930", "240ac48b8940", "240ac48b9a84", "30aea457d2f0",
                            "30aea457d3d8", "240ac48b917c", "240ac48b886c", "240ac48b9c1c", "240ac48ba500"],
                        ["240ac48b8e30", "240ac48b8f88", "240ac48ba188", "240ac48b8c48", "240ac48b9bf0",
                            "240ac48b8c44", "240ac48b978c", "240ac48b8b44", "240ac48b9690", "240ac48b8ebc", "240ac48ba014",
                            "240ac48b8c54", "240ac48b8dac", "240ac48b9d18", "240ac48ba120", "240ac48b9240"],
                        ["240ac48b91d0", "30aea457d59c", "240ac48ba180", "240ac48b8bf4", "240ac48b9468",
                            "240ac48b9194", "240ac48b9a90", "240ac48b8bc4", "240ac48b8a20", "240ac48b8f78", "240ac48ba0d4",
                            "240ac48ba190", "240ac48ba3d8", "30aea457d610", "240ac48b9f68", "30aea457d724"],
                        ["240ac48b94d0", "240ac48b9b54", "30aea457d47c", "240ac48b8a30", "240ac48b8858",
                            "240ac48b98fc", "240ac48b8ef0", "240ac48ba184", "240ac48b9d0c", "240ac48b9724", "240ac48b8b58",
                            "240ac48ba008", "240ac48ba400", "240ac48ba0d0", "240ac48b8d08", "240ac48ba108"],
                        ["240ac48b8e40", "240ac48b935c", "240ac48b98c4", "240ac48b90ac", "240ac48b945c",
                            "240ac48ba3a0", "30aea457d594", "240ac48b97a0", "240ac48b94a0", "240ac48b9f8c", "240ac48b9e5c",
                            "240ac48b893c", "240ac48b9ee8", "240ac48b8c2c", "240ac48b9fa4", "240ac48b97bc"],
                        ["240ac48b9aa8", "240ac48ba334", "240ac48b8dc0", "240ac48ba2ac", "240ac48b96c8",
                            "240ac48b9854", "240ac48b9684", "240ac48ba428", "240ac48b8efc", "240ac48b99a4", "240ac48b9fb4",
                            "240ac48b9f70", "30aea457d680", "240ac48b91dc", "240ac48b9594", "30aea457d52c"],
                        ["240ac48ba2bc", "240ac48b8714", "240ac48b9878", "240ac48b8ea4", "240ac48b8a60",
                            "240ac48b9470", "240ac48b8cd4", "30aea457d5f8", "240ac48b8fc4", "240ac48b9220", "240ac48b9238",
                            "240ac48b8c24", "240ac48ba2e4", "240ac48b9f5c", "240ac48b8f24", "30aea457d5ec"],
                        ["240ac48b8b78", "240ac48b9390", "240ac48b8b30", "240ac48ba4b8", "240ac48ba4cc",
                            "240ac48b8c8c", "30aea457d600", "240ac48b9d84", "240ac48b9338", "240ac48b8cbc", "240ac48b98b0",
                            "240ac48b90c8", "240ac48b8e00", "240ac48ba484", "240ac48b9270", "240ac48b9600"],
                        ["240ac48b8ee4", "30aea457d5f4", "240ac48b97d8", "240ac48b92a0", "240ac48b8844",
                            "240ac48b9158", "240ac48b8cd0", "240ac48ba1b0", "30aea457d480", "240ac48ba3b4", "240ac48b987c",
                            "240ac48b961c", "240ac48b9a94", "240ac48ba534", "240ac48b8dfc", "240ac48ba310"],
                        ["240ac48ba288", "240ac48b8cf8", "240ac48ba4d0", "240ac48ba148", "240ac48b9604",
                            "240ac48b8e64", "30aea457d5c4", "240ac48b8c00", "240ac48b9978", "240ac48b8b9c", "240ac48b8e78",
                            "240ac48b99d8", "30aea457d544", "240ac48b946c", "240ac48ba530", "240ac48b9dc4"],
                        ["240ac48b90e4", "240ac48b91a4", "240ac48b9d44", "240ac48b93c4", "240ac48b8f40",
                            "240ac48b912c", "30aea457d578", "30aea457d510", "240ac48b9be0", "240ac48b8ab4", "240ac48ba580",
                            "240ac48b910c", "240ac48b8f7c", "240ac48ba3dc", "30aea457d61c", "240ac48b9988"],
                        ["240ac48b9e6c", "240ac48b9028", "240ac48b91bc", "240ac48ba0ec", "240ac48b9af0",
                            "240ac48b916c", "240ac48b93c8", "240ac48ba558", "240ac48b91a8", "240ac48b92c0", "240ac48b963c",
                            "240ac48b9d1c", "240ac48b8e38", "240ac48b9234", "240ac48ba618", "240ac48b9058"]
                    ],
                    direction: "right",
                    snakeBody: [],
                    food: {x: 16, y: 16 },
                    snakeId: "",
                    squareId: "",
                    snakeX: 0,
                    snakeY: 0,
                    isEat: false,
                    squareBody: [],
                    existSquare:[],
                    squareType: 11,
                    squareNum: 0,
                    mapList: []
                }

            },
            computed: {

            },
            methods:{
                show: function() {
                    var self = this;
                    self.writingFlag = true;
                    window.onAddQueueTask = self.onAddQueueTask;
                    window.onGetTsfTime = self.onGetTsfTime;
                    self.currentWrite = -1;
                    self.timerNum = 0;
                    self.clearWriting(true);
                    self.operateEvent();
                    MINT.Indicator.open();
                    setTimeout(function() {
                        self.getTsfTime();
                        self.currentRgb = "#ff0000";
                    })
                },
                getTsfTime: function() {
                    var self = this;
                    var deviceList = self.$store.state.deviceList, rootMac = "";
                    $.each(deviceList, function(i, item) {
                        if (item.layer == 1) {
                            rootMac = item.mac;
                            return false;
                        }
                    })
                    var data = '{"' + MESH_MAC + '": "' + rootMac +
                            '","' + MESH_REQUEST + '": "' + GET_TSF_TIME + '"' +
                            ',"callback": "onGetTsfTime"}}';
                    espmesh.requestDevice(data);
                },
                hideTable: function () {
                    this.writingFlag = false;
                    this.$store.commit("setShowScanBle", true);
                    this.$store.commit("setShowLoading", true);
                    this.clearTimerId(true);
                    MINT.Indicator.close();
                    espmesh.closeDeviceLongSocket(this.$store.state.deviceIp);
                    this.$emit("writingShow");
                },
                hideParent: function() {
                    window.onBackPressed = this.hideTable;
                },
                colorPlateBtn: function() {
                    this.colorFlag = true;
                },
                hideColor: function() {
                    this.colorFlag = false;
                },
                //俄罗斯方块
                squareFun: function(num) {
                    var self = this;
                    self.currentWrite = num;
                    self.clearWriting(true);
                    self.initSquare(0, 0);
                    self.squareId = setInterval(function () {
                        self.fall(num);
                        self.squareNum ++;
                    }, 300)
                },
                //随机生成方块
                initSquare: function(x, y) {
                    var self = this;

                    switch (self.squareType) {
                        case 1: // l字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y },
                                {x: x, y: y + 1 },
                                {x: x + 1, y: y + 1},
                                {x: x + 2, y: y + 1}];
                            break;
                        case 2: // l字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y + 1},
                                {x: x + 1, y: y + 1  },
                                {x: x + 2, y: y + 1 },
                                {x: x + 2, y: y}];
                            break;
                        case 3: // l字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y+1 },
                                {x: x, y: y },
                                {x: x + 1, y: y},
                                {x: x + 2, y: y}];
                            break;
                        case 4: // l字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            };
                            self.squareBody = [{x: x, y: y },
                                {x: x + 1, y: y },
                                {x: x + 2, y: y},
                                {x: x + 2, y: y + 1}];
                            break;
                        case 5: // l字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y },
                                {x: x + 1, y: y  },
                                {x: x + 1, y: y + 1 },
                                {x: x + 1, y: y + 2}];
                            break;
                        case 6: // l字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1 },
                                {x: x, y: y + 2 },
                                {x: x + 1, y: y}];
                            break;
                        case 7: // l字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1  },
                                {x: x, y: y + 2 },
                                {x: x + 1, y: y + 2}];
                            break;
                        case 8: // l字
                            if (x == 0 && y == 0) {
                                x = 8;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1  },
                                {x: x, y: y + 2 },
                                {x: x - 1, y: y + 2}];
                            break;
                        case 9: // 田字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y  },
                                {x: x, y: y + 1 },
                                {x: x + 1, y: y + 1}];
                            break;
                        case 10: // 一字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y  },
                                {x: x + 2, y: y  },
                                {x: x + 3, y: y}];
                            break;
                        case 11: // 1字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x, y: y + 3}];
                            break;
                        case 12: // 上字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x + 1, y: y},
                                {x: x , y: y + 1},
                                {x: x + 1, y: y + 1},
                                {x: x + 2, y: y + 1}];
                            break;
                        case 13: // 上字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x + 1, y: y + 1}];
                            break;
                        case 14: // 上字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y},
                                {x: x + 2, y: y},
                                {x: x + 1, y: y + 1}];
                            break;
                        case 15: // 上字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x + 1, y: y},
                                {x: x + 1 , y: y + 1},
                                {x: x + 1, y: y + 2},
                                {x: x, y: y + 1}];
                            break;
                        case 16: // Z字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x + 1, y: y + 1},
                                {x: x + 1, y: y + 2}];
                            break;
                        case 17: // Z字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x + 1, y: y},
                                {x: x + 1 , y: y + 1},
                                {x: x, y: y + 1},
                                {x: x, y: y + 2}];
                            break;
                        case 18: // Z字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y + 1},
                                {x: x + 1 , y: y + 1},
                                {x: x + 1, y: y},
                                {x: x + 2, y: y}];
                            break;
                        case 19: // Z字
                            if (x == 0 && y == 0) {
                                x = 6;
                                y = 0;
                            };
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y},
                                {x: x + 1, y: y + 1},
                                {x: x + 2, y: y + 1}];
                            break;
                        case 20: // 田字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y  },
                                {x: x, y: y + 1 },
                                {x: x + 1, y: y + 1}];
                            break;
                        case 21: // 田字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y  },
                                {x: x, y: y + 1 },
                                {x: x + 1, y: y + 1}];
                            break;
                        case 22: // 田字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x + 1 , y: y  },
                                {x: x, y: y + 1 },
                                {x: x + 1, y: y + 1}];
                            break;
                        case 23:
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x + 1, y: y + 1},
                                {x: x + 1, y: y + 2}];
                            break;
                        case 24:
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x + 1, y: y},
                                {x: x + 1 , y: y + 1},
                                {x: x, y: y + 1},
                                {x: x, y: y + 2}];
                            break;
                        case 25:
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x, y: y + 3}];
                            break;
                        case 26:
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x, y: y + 3}];
                            break;
                        case 27: // l字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x, y: y + 3}];
                            break;
                        case 28: // l字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x, y: y + 3}];
                            break;
                        case 28: // l字
                            if (x == 0 && y == 0) {
                                x = 7;
                                y = 0;
                            }
                            self.squareBody = [{x: x, y: y},
                                {x: x , y: y + 1},
                                {x: x, y: y + 2},
                                {x: x, y: y + 3}];
                            break;
                    }
                    self.changeSquareColor();
                },
                //下落
                fall: function(num) {
                    var self = this;
                    var list = [];
                    var flag = false;
                    self.squareBody.forEach(function(item, i) {
                        list.push(self.snakeList[item.y][item.x]);
                    })
                    var len = self.squareBody.length;
                    for (var i = 0; i < len; i ++) {
                        var item = self.squareBody[i];
                        if (item.y == 15) {
                            flag = true;
                            self.squareNum = 0;
                        }
                        if ((self.squareType == 10 || self.squareType == 16) && item.y == 14) {
                            flag = true;
                            self.squareNum = 0;
                        } else if ((self.squareType == 13 || self.squareType == 19 || self.squareType == 14 ||
                            self.squareType == 8 || self.squareType == 26)
                            && item.y == 13) {
                            flag = true;
                            self.squareNum = 0;
                        } else if ((self.squareType == 18 || self.squareType == 3 || self.squareType == 20 ||
                                self.squareType == 21 || self.squareType == 23)
                            && item.y == 12) {
                            flag = true;
                            self.squareNum = 0;
                        } else if ((self.squareType == 22 )
                            && item.y == 11) {
                            flag = true;
                            self.squareNum = 0;
                        } else if ((self.squareType == 24)
                            && item.y == 10) {
                            flag = true;
                            self.squareNum = 0;
                        } else if ((self.squareType == 27 )
                            && item.y == 9) {
                            flag = true;
                            self.squareNum = 0;
                        } else if ((self.squareType == 28 )
                            && item.y == 5) {
                            flag = true;
                            self.squareNum = 0;
                        } else if (self.squareType == 29 ) {
                            flag = true;
                            self.squareNum = 0;
                        }
                        item.y++;
                        if (self.squareNum == 3 && (self.squareType == 11 || self.squareType == 6 ||
                                self.squareType == 4 || self.squareType == 13 || self.squareType == 14 )) {
                            if (self.squareType == 11) {
                                self.squareBody = [{x: 6, y: 5},
                                    {x: 7 , y: 5},
                                    {x: 8, y: 5},
                                    {x: 9, y: 5}];
                            } else if (self.squareType == 6) {
                                self.squareBody = [{x: 6, y: 5},
                                    {x: 7 , y: 5 },
                                    {x: 8, y: 5 },
                                    {x: 8, y: 6}];
                            } else if (self.squareType == 4) {
                                self.squareBody = [{x: 7, y: 5},
                                    {x: 7 , y: 6 },
                                    {x: 7, y: 7 },
                                    {x: 6, y: 7}];
                            } else if (self.squareType == 13) {
                                self.squareBody = [{x: 7, y: 5},
                                    {x: 6 , y: 6 },
                                    {x: 7, y: 6 },
                                    {x: 8, y: 6}];
                            } else if (self.squareType == 14) {
                                self.squareBody = [{x: 7, y: 4},
                                    {x: 7 , y: 5 },
                                    {x: 6, y: 5 },
                                    {x: 7, y: 6}];
                            }
                            break;
                        } else if (self.squareNum == 4 && (self.squareType == 4 || self.squareType == 14) ) {
                            if (self.squareType == 4) {
                                self.squareBody = [{x: 6, y: 6},
                                    {x: 6 , y: 7 },
                                    {x: 7, y: 7 },
                                    {x: 8, y: 7}];
                            } else if (self.squareType == 14) {
                                self.squareBody = [{x: 7, y: 6},
                                    {x: 7 , y: 7 },
                                    {x: 6, y: 7 },
                                    {x: 8, y: 7}];
                            }

                        } else if (self.squareNum == 5 && (self.squareType == 4) ) {
                            if (self.squareType == 4) {
                                self.squareBody = [{x: 6, y: 7},
                                    {x: 7 , y: 7 },
                                    {x: 6, y: 8 },
                                    {x: 6, y: 9}];
                            }


                        }  else {
                            if (self.squareType == 11 || self.squareType == 10) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 3) {
                                    item.x--
                                }
                            } else if (self.squareType == 13 || self.squareType == 3) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 2) {
                                    item.x--
                                }
                            }  else if (self.squareType == 9 || self.squareType == 24) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 5) {
                                    item.x--
                                }
                            } else if (self.squareType == 18) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 6) {
                                    item.x--
                                }
                            } else if (self.squareType == 14) {
                                if (self.squareNum > 5 && self.squareBody[len-1].x != 7) {
                                    item.x--
                                }
                            } else if (self.squareType == 19 || self.squareType == 22) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 4) {
                                    item.x--
                                }
                            } else if (self.squareType == 8) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 8) {
                                    item.x++
                                }
                            } else if (self.squareType == 6) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 9) {
                                    item.x++
                                }
                            } else if (self.squareType == 25) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 10) {
                                    item.x++
                                }
                            } else if (self.squareType == 12 || self.squareType == 16 || self.squareType == 23) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 15) {
                                    item.x++
                                }
                            } else if (self.squareType == 17 || self.squareType == 21) {
                                if (self.squareNum > 3 && self.squareBody[len-1].x != 12) {
                                    item.x++
                                }
                            } else if (self.squareType == 4) {
                                if (self.squareNum > 5 && self.squareBody[len-1].x != 11) {
                                    item.x++
                                }
                            }
                            self.squareBody.splice(i, 1, item);
                        }
                    }
                    if (flag) {
                        self.squareBody.forEach(function(item, i) {
                            item.type = self.getSquareColor(self.squareType);
                        })
                        self.mapList.push(self.squareBody);
                        if (self.squareType == 25) {
                            clearInterval(self.squareId);
                            self.clearSquare();
                            return false;
                        } else if (self.squareType == 28) {
                            clearInterval(self.squareId);
                            self.setOver();
                            return false;
                        }
                        if (self.squareType == 11) {
                            self.squareType = 10;
                        } else if (self.squareType == 10) {
                            self.squareType = 9;
                        } else if (self.squareType == 9) {
                            self.squareType = 1;
                        } else if (self.squareType == 1) {
                            self.squareType = 6;
                        } else if (self.squareType == 6) {
                            self.squareType = 12;
                        } else if (self.squareType == 12) {
                            self.squareType = 16;
                        } else if (self.squareType == 16) {
                            self.squareType = 17;
                        } else if (self.squareType == 17) {
                            self.squareType = 4;
                        } else if (self.squareType == 4) {
                            self.squareType = 13;
                        } else if (self.squareType == 13) {
                            self.squareType = 19;
                        } else if (self.squareType == 19) {
                            self.squareType = 14;
                        } else if (self.squareType == 14) {
                            self.squareType = 18;
                        } else if (self.squareType == 18) {
                            self.squareType = 3;
                        } else if (self.squareType == 3) {
                            self.squareType = 8;
                        } else if (self.squareType == 8) {
                            self.squareType = 20;
                        } else if (self.squareType == 20) {
                            self.squareType = 21;
                        } else if (self.squareType == 21) {
                            self.squareType = 22;
                        } else if (self.squareType == 22) {
                            self.squareType = 23;
                        } else if (self.squareType == 23) {
                            self.squareType = 24;
                        } else if (self.squareType == 24) {
                            self.squareType = 25;
                        } else if (self.squareType == 25) {
                            self.squareType = 26;
                        } else if (self.squareType == 26) {
                            self.squareType = 27;
                        } else if (self.squareType == 27) {
                            self.squareType = 28;
                        } else if (self.squareType == 28) {
                            self.squareType = 29;
                        }
                        self.initSquare(0, 0);
                    } else {
                        self.setDeviceColor(list, "#00c0ef");
                    }
                    self.changeSquareColor();
                },
                clearSquare: function() {
                    var self = this;
                    var list = [
                        ["240ac48b8d08", "240ac48b9fa4", "240ac48ba0d0", "240ac48b8c2c", "240ac48ba108", "240ac48b97bc"],
                        ["240ac48b9f68", "240ac48b9594", "30aea457d610", "240ac48b91dc", "30aea457d724", "30aea457d52c"],
                        ["240ac48ba120", "240ac48b8f24", "240ac48b9d18", "240ac48b9f5c", "240ac48b9240", "30aea457d5ec"],
                        ["240ac48b9c1c", "240ac48b9270", "240ac48b886c", "240ac48ba484", "240ac48ba500", "240ac48b9600"],
                        ["30aea457d6c0", "240ac48b8dfc", "240ac48ba1f4", "240ac48ba534", "240ac48b87a8", "240ac48ba310"],
                        ["240ac48b9110", "240ac48ba530", "240ac48b8738", "240ac48b946c",  "240ac48b9c2c", "240ac48b9dc4"],
                        ["240ac48b9344", "30aea457d61c", "240ac48b97a4", "240ac48ba3dc", "240ac48ba0e0", "240ac48b9988"],
                        ["240ac48b9204", "240ac48ba618", "240ac48b94f8", "240ac48b9234", "240ac48b870c", "240ac48b9058"]
                    ];
                    console.log(self.mapList);
                    var num = 0;
                    self.squareId = setInterval(function() {
                        self.setDeviceColor(list[num], "#00c0ef");
                        if (num == 7) {
                            clearInterval(self.squareId);
                            var mapList = {}, typeList = [];
                            console.log(self.mapList);
                            self.mapList.forEach(function(item, i) {
                                item.forEach(function(itemSub, j) {
                                    if (itemSub.y < 14) {
                                        var type = itemSub.type;
                                        console.log(type);
                                        if (typeList.indexOf(type) != -1) {
                                            mapList['"' + type + '"'].push(itemSub);
                                        } else {
                                            typeList.push(type);
                                            mapList['"' + type + '"'] = [itemSub];
                                        }
                                    }
                                })
                            });
                            var flag = false;
                            var removeNum = 0;
                            self.squareId = setInterval(function() {
                                var removeList = [];
                                for (var i in mapList) {
                                    mapList[i].forEach(function (item, j) {
                                        if (removeNum == 0) {
                                            item.y -= 1
                                        }
                                        removeList.push(self.snakeList[item.y][item.x]);
                                    })
                                }
                                removeNum ++;
                                var saveList = [];
                                for (var i in mapList) {
                                    var itemList = mapList[i];
                                    for(var j = 0; j < itemList.length; j ++) {
                                        var item = itemList[j];
                                        if (item.y == 15) {
                                            flag = true;
                                            break;
                                        }
                                        item.y++;
                                        itemList.splice(j, 1, item);
                                    }
                                    if (flag) {
                                        clearInterval(self.squareId);
                                        self.squareType = 26;
                                        self.initSquare(0, 0);
                                        self.squareNum = 0;
                                        self.squareId = setInterval(function () {
                                            self.fall(num);
                                            self.squareNum ++;
                                        }, 300)
                                        break;
                                    } else {
                                        mapList[i] = itemList;
                                    }
                                }
                                if (!flag) {
                                    self.setDeviceColor(removeList, "#00c0ef");
                                    for (var i in mapList) {
                                        var itemList = mapList[i];
                                        console.log("ssasad");
                                        self.removeColor(itemList, i.substr(1, i.length - 2));
                                    }
                                }
                            }, 300);
                        }
                        num ++;
                    }, 300);
                },
                setOver: function() {
                    var list = ["240ac48b87c8", "240ac48b8f88", "240ac48ba334", "30aea457d5f4", "240ac48ba3fc",
                        "240ac48ba180", "240ac48b8dc0", "240ac48b97d8", "240ac48b92e0", "240ac48b8bf4", "240ac48ba2ac",
                        "240ac48b92a0", "240ac48b90e0", "240ac48b9468", "240ac48b96c8", "240ac48b8844", "240ac48b8f70",
                        "240ac48b9194", "240ac48b9854", "240ac48b9158", "240ac48b9ff8", "240ac48b9a90", "240ac48b9684",
                        "240ac48b8cd0", "240ac48b8930", "240ac48b8b44", "30aea457d5f8", "240ac48b9d84", "240ac48b9440",
                        "240ac48b9a84", "240ac48b8ebc", "240ac48b8f78", "240ac48b99a4", "240ac48b9220", "240ac48b8cbc",
                        "240ac48b9f38", "240ac48b9fb4", "240ac48b987c", "240ac48b87a4", "240ac48b9f70", "240ac48b961c",
                        "240ac48b9414", "240ac48b917c", "240ac48b8dac", "240ac48ba3d8", "30aea457d680", "240ac48ba2e4",
                        "240ac48b8e00", "240ac48ba1f4", "240ac48b91dc", "240ac48b9f5c", "30aea457d6c0", "240ac48b9594",
                        "240ac48b9270", "240ac48b87a8", "240ac48ba500", "240ac48b9240", "30aea457d724", "30aea457d52c",
                        "240ac48ba310"];
                    this.clearWriting();
                    this.setDeviceColor(list, "#ff0000");
                },
                removeColor: function(squareList, color) {
                    var self = this;
                    var list = [];
                    squareList.forEach(function(item, i) {
                        if (!Util._isEmpty(item.y) && !Util._isEmpty(item.x)) {
                            list.push(self.snakeList[item.y][item.x]);
                        }
                    });
                    self.setDeviceColor(list, color);
                },
                changeSquareColor: function() {
                    var self = this;
                    var list = [];
                    self.squareBody.forEach(function(item, i) {
                        if (!Util._isEmpty(item.y) && !Util._isEmpty(item.x)) {
                            list.push(self.snakeList[item.y][item.x]);
                        }
                    });
                    self.setDeviceColor(list, self.getSquareColor(self.squareType));
                },
                getSquareColor: function(type) {
                    var self = this;
                    var color = "#ff0000";
                    if ([10, 11, 26].indexOf(type) != -1) {
                        color = "#ff0000";
                    } else if ([9, 20, 21, 22].indexOf(type) != -1) {
                        color = "#ff8000"
                    } else if ([1, 3, 4, 6, 8].indexOf(type) != -1) {
                        color = "#ffff00";
                    } else if ([12, 13, 14, 15].indexOf(type) != -1) {
                        color = "#00ff00";
                    } else if ([16, 17, 18, 19, 23, 24].indexOf(type) != -1) {
                        color = "#8000ff";
                    }
                    return color;
                },
                //贪吃蛇
                snakeFun: function (num) {
                    var self = this;
                    self.currentWrite = num;
                    self.clearWriting(true);
                    self.initSnake();
                },
                initSnake: function() {
                    var self = this;
                    self.direction = "right";
                    self.snakeBody = [{x: 2, y: 0}, {x: 1, y:0}, {x: 0, y: 0}];
                    self.snakeX += 2;
                    self.snakeY = 0;
                    self.changeColor();
                    self.initFood();
                    self.snakeId = setInterval(function() {
                        self.snakeRun();
                    }, 200);

                },
                // 让蛇跑起来,后一个元素到前一个元素的位置
                // 蛇头根据方向处理，所以i不能等于0
                snakeRun: function() {
                    var body = this.snakeBody[this.snakeBody.length-1];
                    var newBody = {x: body.x, y: body.y};
                    for (var i = this.snakeBody.length-1; i > 0; i--) {
                        this.snakeBody[i].x = this.snakeBody[i-1].x;
                        this.snakeBody[i].y = this.snakeBody[i-1].y;
                    }
                    // 根据方向处理蛇头
                    switch(this.direction)
                    {
                        case "left":
                            console.log("left");
                            if (this.food.y == this.snakeBody[0].y ) {
                                if (this.food.x < this.snakeBody[0].x) {
                                    this.snakeBody[0].x -= 1;
                                } else if (this.food.x > this.snakeBody[0].x) {
                                    if (this.food.y == 0) {
                                        this.snakeBody[0].y += 1;
                                        this.direction = "down";
                                    } else {
                                        this.snakeBody[0].y -= 1;
                                        this.direction = "up";
                                    }
                                }

                            } else  if (this.food.y != this.snakeBody[0].y) {
                                if (this.food.x < this.snakeBody[0].x) {
                                    this.snakeBody[0].x -= 1;
                                } else if (this.food.x > this.snakeBody[0].x) {
                                    if (this.snakeBody[0].y == 0) {
                                        this.snakeBody[0].y += 1;
                                        this.direction = "down";
                                    } else {
                                        this.snakeBody[0].y -= 1;
                                        this.direction = "up";
                                    }
                                } else if (this.food.x == this.snakeBody[0].x) {
                                    if (this.food.y > this.snakeBody[0].y) {
                                        this.snakeBody[0].y += 1;
                                        this.direction = "down";
                                    } else if(this.food.y < this.snakeBody[0].y) {
                                        this.snakeBody[0].y -= 1;
                                        this.direction = "up";
                                    }
                                }
                            }
                            break;
                        case "right":
                            console.log("right");
                            if (this.food.y == this.snakeBody[0].y) {
                                if (this.food.x > this.snakeBody[0].x) {
                                    this.snakeBody[0].x += 1;
                                } else if (this.food.x < this.snakeBody[0].x) {
                                    if (this.food.y == 0) {
                                        this.snakeBody[0].y += 1;
                                        this.direction = "down";
                                    } else {
                                        this.snakeBody[0].y -= 1;
                                        this.direction = "up";
                                    }
                                }
                            } else  if (this.food.y != this.snakeBody[0].y) {
                                if (this.food.x > this.snakeBody[0].x) {
                                    this.snakeBody[0].x += 1;
                                } else if (this.food.x < this.snakeBody[0].x) {
                                    if (this.snakeBody[0].y == 0) {
                                        this.snakeBody[0].y += 1;
                                        this.direction = "down";
                                    } else {
                                        this.snakeBody[0].y -= 1;
                                        this.direction = "up";
                                    }
                                } else if (this.food.x == this.snakeBody[0].x) {
                                    if (this.food.y > this.snakeBody[0].y) {
                                        this.snakeBody[0].y += 1;
                                        this.direction = "down";
                                    } else if(this.food.y < this.snakeBody[0].y) {
                                        this.snakeBody[0].y -= 1;
                                        this.direction = "up";
                                    }
                                }
                            }
                            break;
                        case "up":
                            console.log("up");
                            if (this.food.x == this.snakeBody[0].x) {
                                if (this.food.y < this.snakeBody[0].y) {
                                    this.snakeBody[0].y -= 1;
                                } else if (this.food.y > this.snakeBody[0].y) {
                                    if (this.snakeBody[0].x == 0) {
                                        this.snakeBody[0].x += 1;
                                        this.direction = "right";
                                    } else {
                                        this.snakeBody[0].x -= 1;
                                        this.direction = "left";
                                    }

                                }
                            } else if (this.food.x != this.snakeBody[0].x) {
                                if (this.food.y < this.snakeBody[0].y) {
                                    this.snakeBody[0].y -= 1;
                                } else if (this.food.y > this.snakeBody[0].y) {
                                    if (this.snakeBody[0].x > this.food.x) {
                                        this.snakeBody[0].x -= 1;
                                        this.direction = "left";
                                    } else if (this.snakeBody[0].x < this.food.x) {
                                        this.snakeBody[0].x += 1;
                                        this.direction = "right";
                                    }
                                } else if (this.food.y == this.snakeBody[0].y) {
                                    if (this.food.x > this.snakeBody[0].x) {
                                        this.snakeBody[0].x += 1;
                                        this.direction = "right";
                                    } else if(this.food.x < this.snakeBody[0].x) {
                                        this.snakeBody[0].x -= 1;
                                        this.direction = "left";
                                    }
                                }
                            }
                            break;
                        case "down":
                            console.log("down");
                            if (this.food.x == this.snakeBody[0].x) {
                                if (this.food.y > this.snakeBody[0].y) {
                                    this.snakeBody[0].y += 1;
                                } else if (this.food.y < this.snakeBody[0].y) {
                                    if (this.snakeBody[0].x == 0) {
                                        this.snakeBody[0].x += 1;
                                        this.direction = "right";
                                    } else {
                                        this.snakeBody[0].x -= 1;
                                        this.direction = "left";
                                    }
                                }
                            } else if (this.food.x != this.snakeBody[0].x) {
                                if (this.food.y > this.snakeBody[0].y) {
                                    this.snakeBody[0].y += 1;
                                } else if (this.food.y < this.snakeBody[0].y) {
                                    if (this.snakeBody[0].x > this.food.x) {
                                        this.snakeBody[0].x -= 1;
                                        this.direction = "left";
                                    } else if (this.snakeBody[0].x < this.food.x) {
                                        this.snakeBody[0].x += 1;
                                        this.direction = "right";
                                    }

                                } else if (this.food.y == this.snakeBody[0].y) {
                                    if (this.food.x > this.snakeBody[0].x) {
                                        this.snakeBody[0].x += 1;
                                        this.direction = "right";
                                    } else if(this.food.x < this.snakeBody[0].x) {
                                        this.snakeBody[0].x -= 1;
                                        this.direction = "left";
                                    }
                                }
                            }
                            break;
                    }
                    // 判断蛇头吃到食物，xy坐标重合，
                    if (this.snakeBody[0].x == this.food.x && this.snakeBody[0].y == this.food.y) {
                        // 蛇加一节，因为根据最后节点定，下面display时，会自动赋值的
                        if (this.snakeBody.length < 11) {
                            this.snakeBody.push({x:null, y:null});
                        }
                        // 清除食物,重新生成食物
                        this.initFood();
                    }
                    if (!Util._isEmpty(newBody.y) && !Util._isEmpty(newBody.x)) {
                        this.removeBg(this.snakeList[newBody.y][newBody.x]);
                    }
                    this.changeColor();
                },
                initFood: function() {
                    var self = this;
                    var x = Math.floor(Math.random() * 16);
                    var y = Math.floor(Math.random() * 16);
                    for (var i = 0; i < this.snakeBody.length; i++) {
                        var item = this.snakeBody[i];
                        if (item.x == x && item.y == y) {
                            self.initFood();
                            return false;
                            console.log("ssss");
                        }
                    }
                    this.food.x = x;
                    this.food.y = y;
                    this.setDeviceColor([this.snakeList[this.food.y][this.food.x]], "#ff0000");
                },
                changeColor: function() {
                    var self = this;
                    var list = [];
                    self.snakeBody.forEach(function(item, i) {
                        if (!Util._isEmpty(item.y) && !Util._isEmpty(item.x)) {
                            list.push(self.snakeList[item.y][item.x]);
                        }
                    });
                    self.setDeviceColor(list, self.currentRgb);
                },
                removeBg: function(id) {
                    var dom = $("#table-wirting-wrapper").find("td").find("span[data-id='"+id+"']");
                    dom.css("background", "#00c0ef");
                    dom.parent().removeClass("active");
                    this.editLightStatus([id], "#00c0ef", true);
                },
                setDeviceColor: function(list, color) {
                    var self = this;
                    var docs = $("#table-wirting-wrapper").find("span.writing-round");
                    $.each(docs, function(i, item) {
                        var mac = $(item).attr("data-id");
                        if (list.indexOf(mac) != -1) {
                            $(item).parent().addClass("active");
                            $(item).css("background", color);
                        }
                    });
                    self.editLightStatus(list, color, true);
                },
                clearWriting: function(flag) {
                    this.clearTimerId(flag);
                    $("#table-wirting-wrapper").find("td").find("span").css("background", "#00c0ef");
                    $("#table-wirting-wrapper").find("td").removeClass("active");
                    this.editAllStatus();
                },
                selectColor: function(color) {
                    this.currentRgb = color;
                    $("#table-wirting-wrapper").find("td.active").find("span").css("background", this.currentRgb);
                    this.getMacs();
                    this.currentWrite = -1;
                },
                getMacs: function() {
                    var docs = $("#table-wirting-wrapper").find("td.active").find("span"),
                        macs = [];
                    $.each(docs, function (i, item) {
                        var mac = $(item).attr("data-id");
                        if (macs.indexOf(mac) == -1) {
                            macs.push(mac);
                        }
                    })
                    this.editLightStatus(macs, this.currentRgb, true);
                },
                espFun: function(num) {
                    var self = this, listNum = 0, colorNum = 0;
                    self.currentWrite = num;
                    self.clearWriting(true);
                    self.setEspFun(listNum, colorNum);
                },
                setEspFun: function(listNum, colorNum) {
                    var self = this;
                    var timer = 100;
                    self.writeId = setInterval(function() {
                        console.log(timer);
                        if (listNum > 15) {
                            listNum = 0;
                            colorNum++;
                            self.clearTimerId(true);
                            setTimeout(function() {
                                self.setEspFun(listNum, colorNum);
                            }, 800);
                            return false;
                        }
                        if (colorNum > 6) {
                            colorNum = 0;
                            self.clearTimerId(true);
                            setTimeout(function() {
                                self.espAllColor()
                            }, 1000);
                            return false;
                        }
                        switch (listNum) {
                            case 0: self.sendEspColor(self.verticalList0, self.colorList[colorNum]); listNum++; break;
                            case 1: self.sendEspColor(self.verticalList1, self.colorList[colorNum]); listNum++; break;
                            case 2: self.sendEspColor(self.verticalList2, self.colorList[colorNum]); listNum++; break;
                            case 3: self.sendEspColor(self.verticalList3, self.colorList[colorNum]); listNum++; break;
                            case 4: self.sendEspColor(self.verticalList4, self.colorList[colorNum]); listNum++; break;
                            case 5: self.sendEspColor(self.verticalList5, self.colorList[colorNum]); listNum++; break;
                            case 6: self.sendEspColor(self.verticalList6, self.colorList[colorNum]); listNum++; break;
                            case 7: self.sendEspColor(self.verticalList7, self.colorList[colorNum]); listNum++; break;
                            case 8: self.sendEspColor(self.verticalList8, self.colorList[colorNum]); listNum++; break;
                            case 9: self.sendEspColor(self.verticalList9, self.colorList[colorNum]); listNum++; break;
                            case 10: self.sendEspColor(self.verticalList10, self.colorList[colorNum]); listNum++; break;
                            case 11: self.sendEspColor(self.verticalList11, self.colorList[colorNum]); listNum++; break;
                            case 12: self.sendEspColor(self.verticalList12, self.colorList[colorNum]); listNum++; break;
                            case 13: self.sendEspColor(self.verticalList13, self.colorList[colorNum]); listNum++; break;
                            case 14: self.sendEspColor(self.verticalList14, self.colorList[colorNum]); listNum++; break;
                            case 15: self.sendEspColor(self.verticalList15, self.colorList[colorNum]); listNum++; break;
                        }
                    }, timer);
                },
                espAllColor: function() {
                    var self = this, colorNum = 0;
                    self.writeId = setInterval(function() {
                        if (colorNum > 6) {
                            colorNum = 0;
                            self.clearWriting(true);
                            setTimeout(function() {
                                self.sendEspColor(self.espList, self.colorList[colorNum]);
                                setTimeout(function() {
                                    self.espFun(7);
                                }, 3000)
                            }, 2000);
                            return false;
                        }
                        switch (colorNum) {
                            case 0: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                            case 1: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                            case 2: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                            case 3: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                            case 4: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                            case 5: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                            case 6: self.sendEspColor(self.cycleList, self.colorList[colorNum]); colorNum++; break;
                        }
                    }, 1000);
                },
                sendEspColor: function(list, color) {
                    var self = this;
                    var docs = $("#table-wirting-wrapper").find("span.writing-round");
                    $.each(docs, function(i, item) {
                        var mac = $(item).attr("data-id");
                        if (list.indexOf(mac) != -1) {
                            $(item).parent().addClass("active");
                            $(item).css("background", color);
                        }
                    });
                    self.editLightStatus(list, color, true);
                },
                writeWord: function(list, num, flag) {
                    var self = this;
                    self.clearTimerId(true);
                    self.writeColor(list, num, flag);
                },
                writeColor: function(list, num, flag) {
                    var self = this;
                    self.currentWrite = num;
                    var docs = $("#table-wirting-wrapper").find("span.writing-round");
                    console.log(docs.length);
                    self.clearWriting(false);
                    $.each(docs, function(i, item) {
                        var mac = $(item).attr("data-id");
                        if (list.indexOf(mac) != -1) {
                            $(item).parent().addClass("active");
                            $(item).css("background", self.currentRgb);
                        }
                    });
                    setTimeout(function() {
                        self.editLightStatus(list, self.currentRgb, true);
                    }, 500)

                },
                cycleLight: function(num) {
                    var self = this;
                    self.currentWrite = num;
                    self.clearWriting(true);
                    self.timerNum = 0;
                    self.cyclePositiveFun();
                },
                cyclePositiveFun: function() {
                    var self = this;
                    var list = this.cycleList;
                    self.clearTimerId(true);
                    self.marqueeId = setTimeout(function() {
                        var mac = list[self.timerNum];
                        $("table span[data-id='"+mac+"']").css("background", self.currentRgb);
                        if (self.timerNum == list.length-1) {
                            self.editLightStatus([mac], self.currentRgb, true)
                            setTimeout(function() {
                                self.clearTimerId();
                               self.cycleReverseFun();
                            }, 2000)
                        } else {
                            self.timerNum ++;
                            self.editLightStatus([mac], self.currentRgb, true)
                            self.cyclePositiveFun();
                        }
                    }, 100);
                },
                cycleReverseFun: function() {
                    var self = this;
                    var list = this.cycleList;
                    console.log("cycleReverseFun");
                    self.clearTimerId(true);
                    setTimeout(function() {
                        var mac = list[self.timerNum];
                        $("table span[data-id='"+mac+"']").css("background", "#00c0ef");
                        if (self.timerNum == 0) {
                            self.editLightStatus([mac], "#00c0ef", true)
                            setTimeout(function() {
                                self.clearTimerId(true);
                                self.cyclePositiveFun();
                            }, 2000)
                        } else {
                            self.timerNum --;
                            self.editLightStatus([mac], "#00c0ef", true)
                            self.cycleReverseFun();
                        }
                    }, 100);
                },
                clearTimerId: function(flag) {
                    var self = this;
                    if (!Util._isEmpty(self.writeId) && flag) {
                        clearInterval(self.writeId);
                        self.writeId = "";
                    }
                    if (!Util._isEmpty(self.marqueeId)) {
                        clearInterval(self.marqueeId);
                        self.marqueeId = "";
                    }
                    if (!Util._isEmpty(self.unMarqueeId)) {
                        clearInterval(self.unMarqueeId);
                        self.unMarqueeId = "";
                    }
                    if (!Util._isEmpty(self.snakeId)) {
                        clearInterval(self.snakeId);
                        self.snakeId = "";
                    }
                    if (!Util._isEmpty(self.squareId)) {
                        clearInterval(self.squareId);
                        self.squareId = "";
                        self.squareType = 11;
                        self.squareNum = 0;
                    }
                },
                writeCycle: function(num) {
                    var self = this;
                    self.currentWrite = num;
                    self.clearTimerId(true);
                    var number = 1;
                    self.writeId = setInterval(function() {
                        if (number == 1) {
                            self.writeColor(self.oneList, num, false);
                            number = 2;
                        } else if (number == 2) {
                            self.writeColor(self.twoList, num, false);
                            number = 3;
                        } else if (number == 3) {
                            self.writeColor(self.threeList, num, false);
                            number = 4;
                        } else if (number == 4) {
                            self.writeColor(self.fourList, num, false);
                            number = 5;
                        } else if (number == 5) {
                            self.writeColor(self.fiveList, num, false);
                            number = 1;
                        }
                    }, 3000);

                },
                operateEvent: function() {
                    var self = this,
                        selectTag = null,
                        flag = true,
                        docWrapper = $("#table-wirting-wrapper");
                    docWrapper.on({
                        touchstart: function() {
                            self.selectMacs = [];
                            selectTag = $(this).find("span.writing-round").attr("data-id");
                            if (!Util._isEmpty(selectTag)) {
                                var doc = $(this);
                                if (doc.hasClass("active")) {
                                    doc.removeClass("active");
                                    doc.find("span").css("background", "#00c0ef");
                                    self.editLightStatus([selectTag], "#00c0ef", false);
                                } else {
                                    doc.addClass("active");
                                    doc.find("span").css("background", self.currentRgb, false);
                                    self.selectMacs.push(selectTag);
                                }
                            }
                        },
                        touchmove: function(e) {
                            e = e || window.event;
                            e.preventDefault();
                            var touch = e.originalEvent.targetTouches[0];
                            var ele = document.elementFromPoint(touch.pageX, touch.pageY);
                            var selectSubTag = $(ele).attr("data-id");
                            if (selectTag != selectSubTag && !Util._isEmpty(selectSubTag) &&
                                selectSubTag != "table-drop-wirting" && selectSubTag != "table-wirting-wrapper"
                                && selectSubTag != "toporight-wirting-table") {
                                selectTag = selectSubTag;
                                var doc = $(ele).parent();
//                                if (doc.hasClass("active")) {
//                                    doc.removeClass("active");
//                                    doc.find("span").css("background", "#00c0ef");
//                                    self.editLightStatus(selectTag, "#00c0ef");
//                                } else {
                                doc.addClass("active");
                                if (self.selectMacs.indexOf(selectTag) == -1) {
                                    self.selectMacs.push(selectTag);
                                }
                                doc.find("span").css("background", self.currentRgb);
                                setTimeout(function() {
                                    self.editLightStatus(self.selectMacs, self.currentRgb, false);
                                }, 500)
//                                }
                            }
                        },
                        touchend: function() {

                        }
                    }, "td");
                },
                getHue: function(color) {
                    switch(color){
                        case "#ff0000":
                            return 0;
                            break;
                        case "#ff8000":
                            return 30;
                            break;
                        case "#ffff00":
                            return 60;
                            break;
                        case "#00ff00":
                            return 120;
                            break;
                        case "#00ffff":
                            return 180;
                            break;
                        case "#0000ff":
                            return 240;
                            break;
                        case "#8000ff":
                            return 270;
                            break;
                        default:
                            return 191;
                            break;
                    }
                },
                editAllStatus: function() {
                    var macs = this.trList0.concat(this.trList1, this.trList2, this.trList3, this.trList4, this.trList5,
                        this.trList6, this.trList7, this.trList8, this.trList9, this.trList10, this.trList11, this.trList12,
                        this.trList13, this.trList14, this.trList15);
                    this.setAllLight(macs);
                },
                setAllLight: function(macs) {
                    var self = this,
                        meshs = [];
                    meshs.push({cid: HUE_CID, value: 191});
                    meshs.push({cid: SATURATION_CID, value: 100});
                    if (macs.length >= 200) {
                        macs = ["ffffffffffff"];
                    }
                    var data = '{"macs": ' + JSON.stringify(macs) +
                        ',"host": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' +MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs);
                    if (!Util._isEmpty(self.$store.state.tsfTime) && self.$store.state.tsfTime != 0) {
                        var tsfTime = (new Date().getTime()  * 1000) - self.$store.state.tsfTime +
                                            (self.$store.state.delayTime) * 1000;
                        data += ',"tsf_time": "'+ tsfTime +'"';
                    }
                    data += '}';
                    espmesh.addQueueTask(JSON.stringify({"method":"requestDeviceLongSocket","argument": data}));
                },
                editLightStatus: function (macs, color, flag) {
                    var self= this;
                    var meshs = [];
                    meshs.push({cid: HUE_CID, value: parseInt(self.getHue(color))});
                    meshs.push({cid: SATURATION_CID, value: 100});
                    if (macs.length >= 200) {
                        macs = ["ffffffffffff"];
                    }
                    var data = '{"macs": ' + JSON.stringify(macs) +
                        ',"host": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' +MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) ;
                    if (!Util._isEmpty(self.$store.state.tsfTime) && self.$store.state.tsfTime != 0 && flag) {
                        var tsfTime = (new Date().getTime()  * 1000) - self.$store.state.tsfTime +
                                            (self.$store.state.delayTime) * 1000;
                        data += ',"tsf_time": "'+ tsfTime +'"';
                    }
                    data += '}';
                    console.log(data);
                    if (macs.length > 0) {
                        espmesh.addQueueTask(JSON.stringify({"method":"requestDeviceLongSocket","argument": data}));
                    }
                },
                onAddQueueTask: function() {
                },
                onGetTsfTime: function(res) {
                    MINT.Indicator.close();
                    console.log(res);
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        this.$store.commit("setTsfTime", new Date().getTime() * 1000 - parseInt(res.result.tsf_time));
                    }
                },
            },
            created: function () {

            },
            components: {
            }

        });
        return Demo;
    });