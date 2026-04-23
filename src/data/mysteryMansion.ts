import { Game } from "@/types/game";

export const mysteryMansion: Game = {
  gameId: "game_mystery_001",
  title: "古宅之谜",
  genre: "悬疑",
  difficulty: "medium",
  worldSetting: {
    era: "1920年代",
    location: "北方偏远山村",
    factions: ["陈氏家族", "地方势力", "神秘组织"],
    coreConflict: "古宅隐藏的秘密与家族的命运",
  },
  characters: {
    protagonist: {
      name: "陈记者",
      identity: "年轻调查记者",
      goal: "调查家族隐藏的历史真相",
      personality: "理性、执着、好奇心强",
    },
    npcs: [
      {
        id: "npc_001",
        name: "张伯",
        identity: "老管家",
        role: "引导者",
        personality: "忠诚、神秘、欲言又止",
      },
      {
        id: "npc_002",
        name: "小翠",
        identity: "女仆",
        role: "知情人",
        personality: "恐惧、犹豫、心怀愧疚",
      },
    ],
  },
  scenes: [
    {
      sceneId: "scene_001",
      name: "抵达古宅",
      description:
        "黄昏时分，你乘坐黄包车来到陈氏古宅。这座宅院已经废弃多年，外墙斑驳，朱漆大门上的铜环已经生锈。你是来解决叔父遗愿的记者，也是陈家远房表亲。门缓缓打开，一个佝偻的老人出现在门口……",
      choices: [
        {
          choiceId: "choice_001a",
          text: "礼貌问候并自我介绍",
          consequence: "张伯微微点头，眼神复杂",
          nextScene: "scene_002",
          stateChanges: { clues: ["管家的警惕"] },
        },
        {
          choiceId: "choice_001b",
          text: "直接询问叔父的事",
          consequence: "张伯身体一僵，没有回答",
          nextScene: "scene_003",
          stateChanges: {},
        },
      ],
    },
    {
      sceneId: "scene_002",
      name: "初入古宅",
      description:
        "张伯带你穿过庭院，假山后的竹林中隐约传来奇怪的声音，像是有人在低语，又像是风声。你注意到西厢房的窗户微微敞开，里面似乎有什么东西在微微发光……",
      choices: [
        {
          choiceId: "choice_002a",
          text: "前往西厢房查看",
          consequence: "你在西厢房发现了生锈的钥匙",
          nextScene: "scene_004",
          stateChanges: { items: ["生锈的钥匙"] },
        },
        {
          choiceId: "choice_002b",
          text: "先安顿下来，天亮再说",
          consequence: "你决定先行休息，夜里却被异响惊醒",
          nextScene: "scene_005",
          stateChanges: {},
        },
      ],
    },
    {
      sceneId: "scene_003",
      name: "管家密谈",
      description:
        "张伯带你来到偏僻的耳房，关上门。'你不该来这里的……'他的声音颤抖，'二十年前，少爷就是在这里失踪的。他们不会放过任何知道真相的人……'",
      choices: [
        {
          choiceId: "choice_003a",
          text: "追问'他们'是谁",
          consequence: "张伯正要开口，一支冷箭破窗而入！",
          nextScene: "scene_006",
          stateChanges: { clues: ["二十年前的失踪"] },
        },
        {
          choiceId: "choice_003b",
          text: "询问叔父的下落",
          consequence: "张伯透露了关于叔父的秘密",
          nextScene: "scene_007",
          stateChanges: { clues: ["管家的秘密"] },
        },
      ],
    },
    {
      sceneId: "scene_004",
      name: "西厢房密室",
      description:
        "西厢房的灰尘下藏着一间密室。墙壁上刻满了奇怪的符号，桌上堆着发黄的手稿。你认得那些字——是叔父的笔迹。'契约……血脉……永生……'字迹越往后越潦草，像是在极度恐惧中写下的。",
      choices: [
        {
          choiceId: "choice_004a",
          text: "带走手稿仔细研究",
          consequence: "你将手稿藏入怀中，决定深入研究",
          nextScene: "scene_008",
          stateChanges: { items: ["叔父的手稿"], clues: ["仪式"] },
        },
        {
          choiceId: "choice_004b",
          text: "拍照后原样不动",
          consequence: "你小心地拍照留存证据",
          nextScene: "scene_005",
          stateChanges: { clues: ["密室位置"] },
        },
      ],
    },
    {
      sceneId: "scene_005",
      name: "深夜脚步声",
      description:
        "深夜，一阵脚步声将你惊醒。月光下，你看见一个年轻女子的身影走向后院。她的容貌……竟与你失踪的叔父有七分相似。她似乎在引导你前往某个地方。",
      choices: [
        {
          choiceId: "choice_005a",
          text: "追上前去",
          consequence: "你跟着女子来到了祠堂",
          nextScene: "scene_009",
          stateChanges: { relationships: { 幽灵: 1 } },
        },
        {
          choiceId: "choice_005b",
          text: "装作熟睡观察",
          consequence: "你记住了女子的去向",
          nextScene: "scene_010",
          stateChanges: { clues: ["女子的去向"] },
        },
      ],
    },
    {
      sceneId: "scene_006",
      name: "真相的边缘",
      description:
        "张伯终于开口：'陈家世代守护着一个秘密——我们不是普通人。血脉中含有……'他还没说完，一支冷箭破窗而入！箭矢擦着张伯的肩膀飞过，钉在墙上。",
      choices: [
        {
          choiceId: "choice_006a",
          text: "保护张伯",
          consequence: "你挡在张伯身前，赢得他的信任",
          nextScene: "scene_011",
          stateChanges: { relationships: { 张伯: 2 } },
        },
        {
          choiceId: "choice_006b",
          text: "追凶徒",
          consequence: "你冲出耳房追击，却只看到黑暗中的背影",
          nextScene: "scene_012",
          stateChanges: { clues: ["暗处的威胁"] },
        },
      ],
    },
    {
      sceneId: "scene_007",
      name: "叔父的信",
      description:
        "张伯从怀中掏出一封泛黄的信。'这是少爷留给你的。他说如果有人来问，就把这个交出去。'信上的字迹苍劲有力：'血脉之约不可违，但真相不该被永远掩埋。找到地下室，一切都会有答案。'",
      choices: [
        {
          choiceId: "choice_007a",
          text: "请张伯带路去地下室",
          consequence: "张伯犹豫再三，终于点头",
          nextScene: "scene_013",
          stateChanges: { clues: ["地下室入口"], relationships: { 张伯: 1 } },
        },
        {
          choiceId: "choice_007b",
          text: "先了解更多陈家的历史",
          consequence: "张伯讲述了陈家百年的秘密",
          nextScene: "scene_008",
          stateChanges: { clues: ["陈家历史"] },
        },
      ],
    },
    {
      sceneId: "scene_008",
      name: "手稿的秘密",
      description:
        "手稿记载了一个惊人的事实：陈家世代参与了一个神秘仪式，每三十年需要一人进入'那边'维持平衡。你的叔父……是自愿的。手稿最后一页写着：'如果你看到了这些文字，说明你已经被卷入其中。唯有找到地下室，才能打破循环。'",
      choices: [
        {
          choiceId: "choice_008a",
          text: "寻找仪式地点",
          consequence: "你决定找到仪式地点，终结这一切",
          nextScene: "scene_013",
          stateChanges: { clues: ["仪式地点"] },
        },
        {
          choiceId: "choice_008b",
          text: "立即离开这是非之地",
          consequence: "你转身离去，却发现自己无法逃离",
          nextScene: "ending_neutral",
          stateChanges: {},
        },
      ],
    },
    {
      sceneId: "scene_009",
      name: "幽魂对话",
      description:
        "追到祠堂，那女子转过身。你看清了——那是叔父的妻子小翠，三十年前'病逝'的她。'你和你叔父真的很像……'她的声音如同风铃，'他为了守护家族，进入了那个世界。但你不一样，你可以选择。'",
      choices: [
        {
          choiceId: "choice_009a",
          text: "询问如何救叔父",
          consequence: "小翠告诉你救人的方法",
          nextScene: "scene_014",
          stateChanges: { clues: ["救人的方法"] },
        },
        {
          choiceId: "choice_009b",
          text: "转身就跑",
          consequence: "恐惧支配了你，你拼命奔逃",
          nextScene: "ending_bad",
          stateChanges: {},
        },
      ],
    },
    {
      sceneId: "scene_010",
      name: "暗中观察",
      description:
        "你假装熟睡，却暗中记住了那女子消失的方向——后院祠堂。天亮后，你在小翠（女仆）的房中发现了蹊跷：桌上摆着一碗还冒着热气的粥，但她人却不见踪影。枕下压着一张纸条：'今夜子时，祠堂见。'",
      choices: [
        {
          choiceId: "choice_010a",
          text: "按纸条赴约",
          consequence: "你决定夜晚去祠堂一探究竟",
          nextScene: "scene_009",
          stateChanges: { clues: ["约会地点"] },
        },
        {
          choiceId: "choice_010b",
          text: "白天先去祠堂查看",
          consequence: "你在祠堂发现了地下通道的痕迹",
          nextScene: "scene_013",
          stateChanges: { clues: ["祠堂暗道"] },
        },
      ],
    },
    {
      sceneId: "scene_011",
      name: "管家的信任",
      description:
        "你挡在张伯身前，窗外恢复了寂静。张伯老泪纵横：'你是陈家第一个愿意保护我的人。'他终于和盘托出：'地下室在祠堂下面，那里有三十盏长明灯。每灭一盏，就有一个灵魂获得自由。但要小心，守护者不会让你轻易靠近。'",
      choices: [
        {
          choiceId: "choice_011a",
          text: "让张伯带路前往",
          consequence: "张伯带你走了一条隐秘的通道",
          nextScene: "scene_013",
          stateChanges: {
            items: ["张伯的引路符"],
            relationships: { 张伯: 1 },
          },
        },
        {
          choiceId: "choice_011b",
          text: "让张伯先安全离开",
          consequence: "张伯含泪离去，你独自行动",
          nextScene: "scene_008",
          stateChanges: { relationships: { 张伯: 2 } },
        },
      ],
    },
    {
      sceneId: "scene_012",
      name: "暗处的追击",
      description:
        "你冲出耳房，黑影在竹林间穿梭。你追赶至竹林深处，却迷了路。月光下，竹林里浮现出一张张苍白的面孔——那是历代进入'那边'的陈家族人。他们无声地指向同一个方向：祠堂。",
      choices: [
        {
          choiceId: "choice_012a",
          text: "跟随幽灵指引前往祠堂",
          consequence: "幽灵们为你指引了通往祠堂的暗道",
          nextScene: "scene_013",
          stateChanges: { clues: ["幽灵的指引"], relationships: { 幽灵: 2 } },
        },
        {
          choiceId: "choice_012b",
          text: "返回古宅重新规划",
          consequence: "你退回古宅，发现张伯留下了一张地图",
          nextScene: "scene_008",
          stateChanges: { items: ["古宅地图"] },
        },
      ],
    },
    {
      sceneId: "scene_013",
      name: "古宅地下室",
      description:
        "密道通向古宅地下。一座古老的祭坛出现在眼前，周围点着三十盏长明灯——每一盏代表一个进入这里的人。柔和的灯光中，你看到了叔父的面容，他在灯火的微光中向你微笑。'你终于来了，'他的声音在空气中回荡，'现在，你必须做出选择。'",
      choices: [
        {
          choiceId: "choice_013a",
          text: "打破灯盏释放灵魂",
          consequence: "你打破灯盏，金光四射",
          nextScene: "ending_good",
          stateChanges: { clues: ["释放完成"] },
        },
        {
          choiceId: "choice_013b",
          text: "完成叔父未完成的仪式",
          consequence: "你决定接替叔父，成为新的守护者",
          nextScene: "ending_secret",
          stateChanges: { items: ["血脉之力"] },
        },
      ],
    },
    {
      sceneId: "scene_014",
      name: "救赎之路",
      description:
        "小翠轻声说道：'要救他，需要有人愿意用自己的生命之光去交换。三十盏灯，每一盏都连着一个灵魂。你若愿意，就吹灭那盏属于他的灯——但他会回来，而你……将代替他的位置。'她的眼中满是哀伤。",
      choices: [
        {
          choiceId: "choice_014a",
          text: "愿意交换，吹灭那盏灯",
          consequence: "你选择了牺牲自己",
          nextScene: "ending_good",
          stateChanges: { clues: ["自我牺牲"] },
        },
        {
          choiceId: "choice_014b",
          text: "寻找不用牺牲的办法",
          consequence: "你拒绝牺牲，寻找其他出路",
          nextScene: "scene_013",
          stateChanges: { clues: ["另一个方法"] },
        },
      ],
    },
  ],
  endings: [
    {
      endingId: "ending_good",
      title: "真相大白",
      description:
        "你打破灯盏，金光四射。三十年的灵魂终于解脱。祠堂里，只留下一封叔父的信：'不后悔来这世上一遭。小翠，等我。'你知道，有些秘密与其被守护，不如被遗忘。阳光照进古宅，尘埃落定，一切归于平静。你转身走出大门，身后是释然的风声。",
      type: "good",
      requirements: ["释放灵魂"],
    },
    {
      endingId: "ending_bad",
      title: "困于古宅",
      description:
        "你拼尽全力逃出古宅，却发现自己在村里绕了无数圈。黄昏的古宅永远在身后。村民说，这里最近搬来一个年轻的记者……再也没有出来过。夜幕降临，你听见古宅中传来脚步声——那是属于你的灯，正在被点燃。",
      type: "bad",
      requirements: ["逃跑"],
    },
    {
      endingId: "ending_neutral",
      title: "黯然离去",
      description:
        "你离开了古宅，回到城市。手稿被烧毁，秘密永远埋在地下。只是每次路过类似的古宅，你都会想起那个黄昏。那盏灯……究竟意味着什么？夜深人静时，你总觉得自己忘了什么重要的事，却怎么也想不起来。",
      type: "neutral",
      requirements: ["放弃调查"],
    },
    {
      endingId: "ending_secret",
      title: "新的守护者",
      description:
        "仪式完成的那一刻，你看到了另一个世界。那里，你的叔父和小翠在向你招手。你成为了新的守望者。古宅的灯，现在轮到你去点燃。三十年后，会有人来问关于古宅的故事吗？你在灯火的微光中，静静地等待。",
      type: "secret",
      requirements: ["完成仪式", "获得血脉之力"],
    },
  ],
  stateSystem: {
    inventory: ["生锈的钥匙", "叔父的手稿", "血脉之力"],
    clues: [
      "管家的警惕",
      "二十年前的失踪",
      "仪式",
      "仪式地点",
      "救人的方法",
    ],
    relationships: { 张伯: 0, 小翠: 0, 幽灵: 0 },
  },
};
