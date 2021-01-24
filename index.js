(async function () {
  // constant
  // library from cdn
  const ExcelJSUrl =
    "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.0/exceljs.min.js";
  const FileSaverUrl =
    "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js";
  // mihoyo api
  const ItemDataUrl = `https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/items/zh-cn.json`;
  const GachaTypesUrl = `//hk4e-api.mihoyo.com/event/gacha_info/api/getConfigList${location.search}`;
  const GachaLogBaseUrl = `//hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog${location.search}`;
  // rare rank background color
  const rankColor = {
    3: "7F1E90FF",
    4: "7F9370DB",
    5: "7FFF8C00",
  };

  // function
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.append(s);
    });
  }

  function sleep(second) {
    return new Promise((r) => setTimeout(() => r(), second * 1000));
  }

  function getGachaLog(key, page) {
    return fetch(
      GachaLogBaseUrl + `&gacha_type=${key}` + `&page=${page}` + `&size=${20}`
    )
      .then((res) => res.json())
      .then((data) => data.data.list);
  }

  async function getGachaLogs(name, key) {
    let page = 1,
      data = [],
      res = [];
    do {
      console.log(`正在获取${name}第${page}页`);
      res = await getGachaLog(key, page);
      await sleep(0.2);
      data.push(...res);
      page += 1;
    } while (res.length > 0);
    return data;
  }

  function pad(num) {
    return `${num}`.padStart(2, "0");
  }

  function getTimeString() {
    const d = new Date();
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const HH = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
  }

  // processing
  console.log("start load script");
  await loadScript(ExcelJSUrl);
  console.log("load exceljs success");
  await loadScript(FileSaverUrl);
  console.log("load filesaver success");
  const data = await fetch(ItemDataUrl).then((res) => res.json());
  console.log("获取物品列表成功");
  const gachaTypes = await fetch(GachaTypesUrl)
    .then((res) => res.json())
    .then((data) => data.data.gacha_type_list);
  console.log("获取抽卡活动类型成功");

  console.log("开始获取抽卡记录");
  const workbook = new ExcelJS.Workbook();
  for (const type of gachaTypes) {
    const sheet = workbook.addWorksheet(type.name);
    sheet.columns = [
      { header: "时间", key: "time", width: 25 },
      { header: "名称", key: "name", width: 20 },
      { header: "类型", key: "type", width: 15 },
      { header: "星级", key: "rank", width: 15 },
    ];
    // get gacha logs
    const logs = (await getGachaLogs(type.name, type.key)).map((item) => {
      const match = data.find((v) => v.item_id === item.item_id);
      return [item.time, match.name, match.item_type, match.rank_type];
    });
    sheet.addRows(logs);
    // set xlsx cell style
    logs.forEach((v, i) => {
      const style = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rankColor[v[3]] },
      };
      ["A", "B", "C", "D"].forEach((v) => {
        sheet.getCell(`${v}${i + 2}`).fill = style;
      });
    });
  }
  console.log("获取抽卡记录结束");

  console.log("正在导出");
  const buffer = await workbook.xlsx.writeBuffer();
  const timestamp = getTimeString();
  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    `原神抽卡记录导出_${timestamp}.xlsx`
  );
  console.log("导出成功");
})();
