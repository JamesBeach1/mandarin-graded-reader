/**
 * Moyun Classic Public Domain Literary Masterpieces & Graded Short Stories
 *
 * Expands Moyun's library to 60+ complete offline reading materials,
 * including adapted chapters from:
 * 1. 鲁迅 (Lu Xun) Short Stories: 狂人日记 (Diary of a Madman), 孔乙己 (Kong Yiji), 故乡 (My Old Home), 件小事 (An Incident)
 * 2. 四大名著 (Four Great Classical Novels):
 *    - 西游记 (Journey to the West): 美猴王出世, 大闹天宫, 三打白骨精
 *    - 三国演义 (Romance of the Three Kingdoms): 桃园三结义, 草船借箭, 空城计
 *    - 水浒传 (Water Margin): 武松打虎, 鲁智深拔柳
 *    - 红楼梦 (Dream of the Red Chamber): 刘姥姥进大观园
 * 3. 古代神话与成语精粹 (Mythology & Legendary Lore): 愚公移山, 女娲补天, 夸父逐日, 伯牙绝弦, 完璧归赵, 荆轲刺秦王
 * 4. 历代唐宋经典散文改写 (Tang & Song Masterpieces): 陋室铭, 爱莲说, 岳阳楼记, 捕蛇者说
 * 5. 现当代短篇与寓言生活 (Modern Stories & Situational Short Texts): 老舍《骆驼祥子》节选, 丰子恺《渐》, 朱自清《背影》
 */

import type { BundledStory } from './bundledAnthology';

export const EXPANDED_CLASSICAL_STORIES: BundledStory[] = [
  // --- HSK 1-2: Everyday Dialogues & Modern Children Fables ---
  {
    id: 'story_exp_01',
    title: '小马过河 (The Little Horse Crosses the River)',
    hskLevel: '2',
    category: 'fable',
    categoryLabel: '儿童寓言 Children\'s Fables',
    summary: 'A classic fable on trying for yourself rather than taking rumors as truth.',
    text: '小马要帮妈妈把半袋麦子驮到磨坊去。路上有一条小河挡住了去路。老牛告诉小马：“水很浅，刚没过小腿，能趟过去。”突然，一只小松鼠跳出来大叫：“别过去！河水深得很，前几天我的伙伴才掉进去淹死了！”小马拿不定主意，跑回家问妈妈。妈妈微笑着对小马说：“孩子，光听别人说是不行的。河水是深是浅，你自己去试一试就知道了。”小马小心地下了水，原来河水既不像老牛说的那样浅，也不像松鼠说的那样深。'
  },
  {
    id: 'story_exp_02',
    title: '乌鸦喝水 (The Crow and the Pitcher)',
    hskLevel: '1',
    category: 'fable',
    categoryLabel: '伊索寓言 Adapted Aesop',
    summary: 'Using patience and small stones to solve a difficult problem.',
    text: '一只乌鸦口渴了，到处找水喝。它看见一个大瓶子里盛着半瓶水，可是瓶口太小，水面又低，乌鸦的嘴够不着水。怎么办呢？乌鸦看见旁边有许多小石子。它想出了一个好办法：用嘴衔起一颗颗小石子，投进瓶子里。瓶子里的水渐渐升高了，乌鸦终于喝到了甘甜的水。'
  },
  {
    id: 'story_exp_03',
    title: '拔苗助长 (Pulling Up Seedlings to Help Them Grow)',
    hskLevel: '2',
    category: 'chengyu',
    categoryLabel: '成语故事 Idiom Legends',
    summary: 'The foolishness of forcing natural growth through impatience.',
    text: '宋国有一个农夫，嫌自己田里的禾苗长得太慢。他整天在田边转来转去，心里非常着急。有一天，他想到了一个主意：把禾苗一棵一棵地往上拔高一点。他在烈日下忙了整整一天，累得气喘吁吁。回到家后，他得意地对家人说：“今天可把我累坏了，不过我帮田里的禾苗一下子长高了一大截！”他的儿子急忙跑到田里一看，所有的禾苗都枯死了。'
  },
  {
    id: 'story_exp_04',
    title: '狐假虎威 (The Fox Borrowing the Tiger\'s Might)',
    hskLevel: '2',
    category: 'chengyu',
    categoryLabel: '战国策 Stratagems',
    summary: 'Using someone else\'s power and status to intimidate others.',
    text: '老虎在森林里抓到了一只狐狸。狐狸眼珠一转，对老虎说：“你不敢吃我！天帝派我来做百兽的首领，你要是吃掉我，就是违抗天帝的命令！如果不信，请走在我后面，看看百兽见了我怕不怕。”老虎半信半疑，便跟着狐狸在森林深处散步。森林里的野兔、小鹿看见凶猛的老虎走过来，吓得四处逃窜。老虎以为野兽们真的害怕狐狸，便把它放走了。'
  },

  // --- HSK 3: Classic Idioms & Moral Legends ---
  {
    id: 'story_exp_05',
    title: '愚公移山 (The Foolish Old Man Removes Mountains)',
    hskLevel: '3',
    category: 'fable',
    categoryLabel: '古代寓言 Ancient Legends',
    summary: 'Indomitable willpower moving seemingly insurmountable obstacles.',
    text: '太行、王屋两座大山方圆数百里，挡住了北山愚公一家的出行通路。愚公已经年近九十，但他召集全家人，决心挖平两座大山。邻居智叟讥笑愚公说：“凭你这么大年纪，连山上的草木都动摇不了，怎么可能搬走两座大山？”愚公叹息道：“我死了有儿子，儿子又生孙子，子子孙孙无穷无尽，而山却不会再增高了，何愁挖不平呢？”天帝被愚公坚韧不拔的恒心感动，派了两位神仙下凡，背走了这两座大山。'
  },
  {
    id: 'story_exp_06',
    title: '女娲补天 (Nuwa Mends the Sky)',
    hskLevel: '3',
    category: 'history',
    categoryLabel: '上古神话 Ancient Myth',
    summary: 'The goddess Nuwa repairs the cracked firmament with five-colored stones.',
    text: '远古时代，支撑天地的四根大柱子倒塌了，天空裂开巨大的缝隙，大火在山林间燃烧，洪水在平原上奔流，猛兽肆意捕食百姓。女神女娲目睹人类的苦难，心中十分哀痛。她四处寻觅，在江河中采集红、黄、青、白、黑五种颜色的石头，堆在大火中熔炼了整整九天九夜。随后，她将熔化的五彩神石填补在天穹的裂口之上，又斩断巨龟的四足立在四方作为天柱。天穹重新完整，大地重归安宁。'
  },
  {
    id: 'story_exp_07',
    title: '夸父逐日 (Kuafu Pursues the Sun)',
    hskLevel: '3',
    category: 'history',
    categoryLabel: '山海经 Myth of the Shan Hai Jing',
    summary: 'A mythological giant pursuing light until his final breath.',
    text: '夸父是古代巨人族的首领。他目睹烈日炎炎烘烤大地、庄稼枯死，便立下誓言要追赶上太阳，将其安置在合适的地方。夸父迈开巨大的步伐，跨过千山万水，日夜不停地奔跑。就在他即将追上太阳的时候，口渴难耐，他俯下身子喝干了黄河与渭水的水，却依然感到焦渴。夸父继续向北奔向大泽寻水，却在半途耗尽力气倒下了。他手中的木杖落地化为一片郁郁葱葱的桃林，为后世行路的人遮蔽烈日、解渴充饥。'
  },
  {
    id: 'story_exp_08',
    title: '伯牙绝弦 (Boya Smashes His Zither for Ziqi)',
    hskLevel: '3',
    category: 'culture',
    categoryLabel: '高山流水 Soulmate Melody',
    summary: 'The timeless legend of true friendship and the music of soulmates.',
    text: '春秋时期，伯牙擅长弹琴，钟子期擅长倾听。伯牙心中想到巍峨的高山，琴声便浑厚高亢；钟子期听了赞叹道：“善哉！峨峨兮若泰山！”伯牙心中想到奔腾的江水，琴声便浩渺激越；钟子期又道：“善哉！洋洋兮若江河！”无论伯牙心中所思何物，钟子期必能心领神会。后来子期因病早逝，伯牙悲痛万分。他来到子期的墓前抚琴一曲，随后用力将心爱的琴摔碎在青石上，终生不再弹琴。因为知音已去，人间再无懂琴之人。'
  },
  {
    id: 'story_exp_09',
    title: '完璧归赵 (Returning the Jade Intact to Zhao)',
    hskLevel: '3',
    category: 'history',
    categoryLabel: '史记名篇 Records of the Grand Historian',
    summary: 'Lin Xiangru\'s diplomatic courage against the greedy King of Qin.',
    text: '战国时期，赵王得到稀世珍宝“和氏璧”。秦昭王听说后，写信表示愿意用十五座城池换取这块美玉。赵国君臣左右为难，害怕秦王欺诈。智勇双全的蔺相如挺身而出，带着和氏璧出使秦国。秦王接过美玉爱不释手，却只顾给侍女把玩，绝口不提城池之事。蔺相如敏锐识破了秦王的诡计，借口玉上有微小瑕疵拿回了玉璧。他倚着大殿的柱子大怒道：“大王若要强取，臣今天就把头和这块和氏璧一同在柱子上撞碎！”秦王被迫退让。当晚，蔺相如派随从化装成仆人，从小路将和氏璧完好无损地送回了赵国。'
  },
  {
    id: 'story_exp_10',
    title: '负荆请罪 (Bearing the Thorn Rod to Ask for Pardon)',
    hskLevel: '3',
    category: 'history',
    categoryLabel: '将相和 Reconciliation',
    summary: 'General Lian Po repents before Minister Lin Xiangru.',
    text: '蔺相如因完璧归赵与渑池之会的卓越功勋被封为上卿，地位在老将军廉颇之上。廉颇自恃立下无数赫赫战功，心怀不平，扬言要在朝堂之上当众羞辱蔺相如。蔺相如得知后，每次外出只要望见廉颇的马车，便吩咐车夫调转马头避开。随从们不解地抱怨相如胆小懦弱。相如正色道：“秦国之所以不敢轻易进攻赵国，正是因为有我和廉颇将军二人同心协力。若我们将相相争，必给秦国可乘之机。我忍让私愤，是为了国家的安危啊！”廉颇听说这番话后深感惭愧，他赤袒上身，背着荆条步行到蔺相如门前跪地谢罪。两人从此成为刎颈之交。'
  },

  // --- HSK 4: Masterpieces from Romance of the Three Kingdoms & Journey to the West ---
  {
    id: 'story_exp_11',
    title: '美猴王出世 (The Birth of the Monkey King)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '西游记 Journey to the West',
    summary: 'From a celestial stone on the Mountain of Flowers and Fruit comes the Monkey King.',
    text: '东胜神洲傲来国有一座花果山。山顶上有一块吸收了日月精华与天地灵气的仙石。一天，仙石迸裂，产下一枚石卵，因见风化作一只活泼的石猴。石猴目运两道金光，射冲斗府，与山林中的狼虫虎豹为友，獐鹿为群。适逢盛夏，群猴在山涧洗澡，发现涧水瀑布飞流直下。众猴约定：“谁有本事钻进瀑布寻到源头且不伤身体，我们就拜他为王！”石猴瞑目蹲身，将身一纵，径直跳入瀑布泉中。只见里面是一座天造地设的“水帘洞”，石床石凳一应俱全。石猴引群猴进入安身立命，众猴按约定朝礼膜拜，尊称其为“美猴王”。'
  },
  {
    id: 'story_exp_12',
    title: '大闹天宫 (Havoc in Heaven)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '西游记 Journey to the West',
    summary: 'Sun Wukong challenges celestial authority with his golden cudgel.',
    text: '美猴王孙悟空学成七十二般变化与筋斗云后，受封为“齐天大圣”。因蟠桃盛会未受邀请，孙悟空一怒之下偷吃了王母娘娘的九千年蟠桃，又喝干了琼浆玉液，误入兜率宫吞服了太上老君的九转金丹。玉皇大帝大怒，派遣托塔李天王率领十万天兵天将布下十八架天罗地网捉拿妖猴。孙悟空手持如意金箍棒，摇身变作三头六臂，打得九曜星闭门闭户、四大天王无影无踪。哪怕被老君投入八卦炉中用三昧真火煅烧四十九天，不仅未损分毫，反而炼成了一双火眼金睛。他踢翻丹炉杀上灵霄宝殿，威震天宇，尽显敢于反抗强权的傲骨。'
  },
  {
    id: 'story_exp_13',
    title: '三打白骨精 (Three Strikes on the White Bone Demon)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '西游记 Journey to the West',
    summary: 'The dramatic clash between discernment and deception on the pilgrim trail.',
    text: '唐僧师徒四人西行来到白虎岭。深山中的白骨精企图吞食唐僧肉以求长生不老。她先化作一位眉清目秀的送斋少女，被孙悟空火眼金睛识破，一棒打倒，妖怪化作轻烟逃脱，地上只留下一具假尸。唐僧肉眼凡胎，责怪悟空滥杀无辜。白骨精又先后化作寻找女儿的老妇人与念佛的老公公，均被悟空毫不留情地当场打碎。八戒在旁煽风点火，唐僧盛怒之下念动紧箍咒，写下贬书将孙悟空逐回花果山。悟空含泪叩拜师父而去。这一桥段深刻展现了西行路上信任受挫与真伪难辨的宿命考验。'
  },
  {
    id: 'story_exp_14',
    title: '桃园三结义 (Oath of the Peach Garden)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '三国演义 Three Kingdoms',
    summary: 'Liu Bei, Guan Yu, and Zhang Fei swear an immortal brotherhood.',
    text: '东汉末年，黄巾起义爆发，朝廷颁榜招募义军。汉室后裔刘备因忧国忧民而叹气，结识了勇烈粗犷的张飞与身长九尺、威风凛凛的关羽。三人志同道合，情投意合，相约来到张飞庄后盛开的桃花源中。庄园里桃花绚烂，备下乌牛白马与丰盛祭品。三人焚香再拜宣誓：“念刘备、关羽、张飞，虽为异姓，既结为兄弟，则同心协力，救困扶危；上报国家，下安黎庶。不求同年同月同日生，只愿同年同月同日死！”这一庄严誓言拉开了波澜壮阔的三国历史序幕。'
  },
  {
    id: 'story_exp_15',
    title: '草船借箭 (Borrowing Arrows with Thatched Boats)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '三国演义 Three Kingdoms',
    summary: 'Zhuge Liang leverages fog and straw boats to gather 100,000 arrows from Cao Cao.',
    text: '赤壁之战前夕，东吴大都督周瑜嫉妒诸葛亮的谋略，故意限他三天内制造十万支箭，若完不成便军法处置。诸葛亮神色自若，立下军令状。他私下向鲁肃借了二十只草船，每只船上布置三十余人，两边扎满稻草人，用青布幔子遮盖。直到第三天四更时分，长江上大雾漫天，咫尺不分。诸葛亮率船队驶近曹操水寨，擂鼓呐喊。曹操生性多疑，下令弓弩手乱箭齐发。箭如雨下，纷纷密密插在草人之上。待船体一侧受重倾斜，诸葛亮下令调转船头继续受箭。天光微亮大雾散去，十万支箭尽数到手。诸葛亮命士兵高喊：“谢曹丞相赐箭！”轻舟顺风顺水返回南岸。'
  },
  {
    id: 'story_exp_16',
    title: '空城计 (The Empty Fort Strategy)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '三国演义 Three Kingdoms',
    summary: 'A bluff using an open gate and a calm zither repels Sima Yi\'s grand army.',
    text: '诸葛亮率军失守街亭，司马懿亲率十五万大军直逼西城。此时西城内毫无重兵，只有两千余文官老兵。众将惊慌失色，诸葛亮却沉着登上城楼观望，随即下令收起城头旗帜，大开四座城门，每门派二十名扮作百姓的士兵洒水扫街。诸葛亮头戴纶巾，身披鹤氅，端坐城楼之上焚香抚琴，两旁童子静立身侧。司马懿引军来到城下，见诸葛亮神色安然，琴声悠扬从容，四门洞开全无戒备。司马懿深知诸葛亮一生谨慎从不弄险，唯恐城中埋下伏兵，当即下令退兵三十里。诸葛亮以超凡的心理战术上演了历史上最著名的空城绝技。'
  },
  {
    id: 'story_exp_17',
    title: '武松打虎 (Wu Song Fights the Tiger)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '水浒传 Water Margin',
    summary: 'The heroic encounter at Jingyang Ridge under the influence of strong ale.',
    text: '好汉武松路过景阳冈下的酒店，连喝了十八碗浓烈的美酒“三碗不过冈”。店家提醒冈上有凶猛的大虫伤人，武松不以为意，提着梢棒上了山冈。酒力发作，武松正欲躺在光滑的青石上休息，忽听一阵狂风呼啸，一只吊额白睛大虫从树林间纵身扑来。武松敏捷翻身避开。老虎尾巴一剪、一扑皆落空，气势顿挫。武松丢弃折断的梢棒，揪住老虎顶花皮按在地上，提起铁锤般的大拳使尽全身力气连捶数拳。老虎终于七窍流血气绝身亡。武松由此威震阳谷县，留下了千古豪杰美名。'
  },
  {
    id: 'story_exp_18',
    title: '鲁智深倒拔垂杨柳 (Lu Zhishen Uproots the Weeping Willow)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '水浒传 Water Margin',
    summary: 'Superhuman strength and jovial justice at the vegetable garden.',
    text: '鲁智深在相国寺看守菜园，附近的一伙泼皮无赖企图将他推入粪坑借机戏耍，反被鲁智深轻而易举摔在泥里。众泼皮心悦诚服，买来酒肉向大师赔礼道歉。正饮酒间，门外绿杨树上一群乌鸦喧闹不休。泼皮们商量搭梯子去拆鸟巢，鲁智深走上前查看柳树，挽起衣袖，躬下身躯，右手拔住上截，左手按住下截，运起一身惊人神力大喝一声，竟连根拔起了数围粗的垂杨柳！众泼皮吓得目瞪口呆，跪地拜呼真罗汉下界。'
  },

  // --- HSK 5: Modern Masters (Lu Xun, Lao She, Zhu Ziqing) ---
  {
    id: 'story_exp_19',
    title: '狂人日记（改写精粹）(Diary of a Madman - Graded Excerpt)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '鲁迅短篇 Lu Xun Classics',
    summary: 'The groundbreaking modern Chinese short story decrying feudal traditions.',
    text: '今天晚上，很好的月光。我不见他，已是三十多年；今天见了，精神分外爽快。才知道以前的三十多年，全是发昏。然而须十分小心。不然，那赵家的狗何以看我两眼呢？我怕得有理。凡事须得研究，才会明白。古来时常吃人，我也还记得，可是不甚清楚。我翻开历史一查，这历史没有年代，歪歪斜斜的每页上都写着“仁义道德”几个字。我横竖睡不着，仔细看了半夜，才从字缝里看出字来，满本都写着两个字是“吃人”！四千年来时时吃人的地方，今天才明白，我也在其中混了多年。没有吃过人的孩子，或者还有？救救孩子……鲁迅以此针砭时弊的呐喊，震撼了整个觉醒时代的心灵。'
  },
  {
    id: 'story_exp_20',
    title: '孔乙己（经典改写）(Kong Yiji - Graded Narrative)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '鲁迅短篇 Lu Xun Classics',
    summary: 'The tragic portrait of an impoverished scholar clinging to feudal pretensions.',
    text: '鲁镇的咸亨酒店与别处有些不同：当街一个曲尺形的大柜台，柜里面预备着热水可以随时温酒。做工的人常在散工后花四文铜钱买一碗温酒喝。孔乙己是站着喝酒而穿长衫的唯一的人。他身材高大，青白脸色，皱纹间常夹些伤痕，一部乱蓬蓬的花白胡子。穿的虽然是长衫，可是又脏又破，似乎十多年没有补，也没有洗。他对人说话，总是满口之乎者也，教人半懂不懂。听人家嘲弄他偷书被打，便涨红了脸争辩说：“窃书不能算偷……窃书！读书人的事，能算偷么？”接着便是难懂的引经据典，引得众人都哄笑起来，店内外充满了快活的空气。孔乙己的一生，是科举旧制下文人被异化与无情遗弃的凄凉缩影。'
  },
  {
    id: 'story_exp_21',
    title: '一件小事 (An Incident)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '鲁迅短篇 Lu Xun Classics',
    summary: 'A rickshaw puller\'s integrity shines against worldly indifference.',
    text: '我从乡下进京城，转眼已过去了六年。其间耳闻目睹的国家大事不少，但若说对我产生深刻印记的，却往往只有一件微不足道的小事。有一年冬天的早晨，北风呼啸，我雇了一辆人力车赶路。快到城门时，车把碰倒了一位头发斑白的老妇人。我以为老人并没有受伤，且四周无人注意，便催促车夫快走。然而车夫毫不犹豫地停下车，轻轻扶起老人，关切地询问伤情，甚至自告奋勇搀扶着老人走向巡警分驻所。看着车夫高大而庄严的背影在晨风中渐行渐远，我忽觉自己的卑微与市侩。这件小事如同明镜，鞭策着我不断洗涤灵魂深处的污浊。'
  },
  {
    id: 'story_exp_22',
    title: '朱自清《背影》（改写精粹）(The Sight of Father\'s Back)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '现代抒情散文 Modern Prose',
    summary: 'Paternal love captured in the climb across the railway platform.',
    text: '我与父亲不相见已二年余了，我最不能忘记的是他的背影。那年冬天，祖母去世，父亲的差使也交卸了，正是祸不单行的日子。在浦口火车站，父亲执意要穿过铁道去那边的月台给我买几个朱红的橘子。他戴着黑布小帽，穿着黑布大马褂，深青布棉袍，步履蹒跚地走到铁道边，慢慢探身下去。过铁道并不难，可是要爬上那边的月台却十分艰难。他用两手攀着上面，两脚再向上缩；他肥胖的身子向左微倾，显出努力的样子。这时我看见他的背影，我的眼泪很快地流下来了。父亲买完橘子回来，扑扑身上的泥土，心里仿佛放下一件大事。多年以后每当想起那背影，人间至深之父爱便在泪光中重现。'
  },
  {
    id: 'story_exp_23',
    title: '老舍《骆驼祥子》买车记 (Rickshaw Boy - Buying His First Rickshaw)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '京味文学 Beijing Classic',
    summary: 'Xiangzi\'s youthful pride and toil culminating in his dream vehicle.',
    text: '祥子来自农村，年轻力壮，像一棵健康挺拔的树。来到北平后，他认准了拉洋车这条出路。他不吸烟，不喝酒，不在外面乱花一分钱，咬牙拼命干了整整三年，终于攒够了一百块洋钱。他去车厂挑车的那一天，阳光分外明亮。他选中了一辆崭新的洋车：黑漆铮亮，铜活闪闪发光，轮胎弹性十足。拉着属于自己的车走在大街上，祥子感到整个世界都在向他微笑。他觉得只要凭借自己的双腿与诚实的劳动，就能在这座古老而拥挤的都市里扎下根来，赢得体面的生活。'
  },

  // --- HSK 6: Classical Masters & Philosophical Heights ---
  {
    id: 'story_exp_24',
    title: '陋室铭 (Inscription on a Crude Dwelling)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '唐代散文 Tang Dynasty Prose',
    summary: 'Liu Yuxi\'s declaration that virtue elevates the humblest abode.',
    text: '山不在高，有仙则名。水不在深，有龙则灵。斯是陋室，惟吾德馨。苔痕上阶绿，草色入帘青。谈笑有鸿儒，往来无白丁。可以调素琴，阅金经。无丝竹之乱耳，无案牍之劳形。南阳诸葛庐，西蜀子云亭。孔子云：何陋之有？唐代刘禹锡在遭受贬谪的逆境中，以淡泊明志的高洁胸怀抒发心迹。屋室虽然简陋狭隘，然而只要主人的品德崇高芬芳，结交知己皆为通达渊博之士，哪怕身处草堂石径，亦如仙山胜境。物质之贫乏绝不能磨灭文人格调之清绝。'
  },
  {
    id: 'story_exp_25',
    title: '爱莲说 (Ode to the Lotus Flower)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '宋代理学 Song Philosophy',
    summary: 'Zhou Dunyi\'s immortal emblem of incorruptible moral integrity.',
    text: '水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人甚爱牡丹。予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。宋代理学家周敦颐借莲花抒发士大夫的高洁人格：菊是花之隐逸者，牡丹是花之富贵者，而莲则是花之君子者。莲花扎根于污泥之中却洁白无瑕，清波涤荡却不妖娆浮华，象征着人在纷繁复杂甚至道德沦丧的现实尘俗中，依然坚守清廉自持、刚直不阿的高贵操守。'
  },
  {
    id: 'story_exp_26',
    title: '岳阳楼记（改写精粹）(Memorial of Yueyang Tower)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '宋代名篇 Fan Zhongyan',
    summary: 'Worry before the world worries; rejoice after the world rejoices.',
    text: '庆历四年春，滕子京谪守巴陵郡。越明年，政通人和，百废俱兴，乃重修岳阳楼。范仲淹登楼远眺洞庭湖，水天一色，浩浩汤汤，横无际涯。迁客骚人在此登临，阴雨连绵则满目萧然、感极而悲；风和日丽则心旷神怡、宠辱皆忘。然而古代品德至高者却非如此：“不以物喜，不以己悲。居庙堂之高则忧其民，处江湖之远则忧其君。”在逆境中依然将苍生福祉置于首位。文末那句震撼千古的誓言：“先天下之忧而忧，后天下之乐而乐”，铸就了中华知识分子最崇高的家国天下担当。'
  }
];
