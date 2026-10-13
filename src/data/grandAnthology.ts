/**
 * Moyun Public Domain Grand Library Ingestion (NONLLM-008)
 *
 * Expands Moyun's out-of-the-box reading catalog to over 80+ complete texts,
 * integrating authentic Chinese folk tales, children's classics, philosophical dialogues,
 * Buddhist parables (百喻经, 禅宗公案, 般若心经), and four great romantic legends.
 */

import type { BundledStory } from './bundledAnthology';

export const GRAND_CHINESE_COLLECTION: BundledStory[] = [
  // ==========================================================================
  // SECTION 1: BUDDHIST PARABLES & DHARMA TEACHINGS (佛家智慧与百喻经)
  // ==========================================================================
  {
    id: 'buddhist_01_yuren_shiyan',
    title: '百喻经之愚人食盐 (The Fool Who Ate Salt - Baiyu Jing)',
    hskLevel: '2',
    category: 'culture',
    categoryLabel: '佛经寓言 Buddhist Parables',
    summary: 'A parable about moderation and understanding causes: salt brings flavor, but eating only salt ruins the palate.',
    text: '从前有一个愚人，到朋友家里作客。主人热情地招待他，端上来许多可口的饭菜。愚人尝了一口，嫌菜的味道太淡，并不好吃。主人听了，便往菜里加了一点点食盐。愚人再次品尝，觉得味道极其鲜美，便好奇地问主人：“为什么加了这个白白的东西，菜就变得这么香呢？”主人回答说：“这是盐。只要放少许盐，就能调出百味。”愚人听了心里暗暗想：“放一点点就这么好吃，如果放很多很多，岂不是人间绝妙的美味？”于是，愚人回到家里，直接抓起一大把纯盐塞进嘴里大嚼起来。结果又苦又咸，不仅喉咙像着了火，舌头也败坏了味觉。这个寓言告诉人们：凡事过犹不及，修行与生活都要懂得适度的智慧。'
  },
  {
    id: 'buddhist_02_san_ceng_lou',
    title: '百喻经之三重楼喻 (The Three-Story Tower - Baiyu Jing)',
    hskLevel: '3',
    category: 'culture',
    categoryLabel: '佛经寓言 Buddhist Parables',
    summary: 'A wealthy fool demands a carpenter build only the third floor without foundations.',
    text: '往昔有一个富翁，生性愚钝。有一天，他去另一个村庄拜访朋友，看见朋友家新盖了一座三层高楼。楼阁高耸入云，窗明几净，站在最上面一层可以远眺秀丽的山川风景。富翁心里羡慕极了，回家后立刻找来本城最著名的木匠，命令道：“你照着那座楼的样子，也给我盖一座一模一样的高楼！”木匠领命，开始在地上测量、挖地基、夯筑坚实的泥土，并架起第一层的粗大柱子。富翁前来看工，大声斥责道：“我只要最上面那层风光无限的第三层楼！下面这两层又矮又黑，我根本不住，你为什么要浪费工时去盖它们？”木匠放下斧头，笑着回答：“天底下哪有不建第一层和第二层，就能凭空悬空出现的第三层楼呢？”这个故事教导世人：做学问与修养道德，必须从脚踏实地的基础开始，不可好高骛远妄想一步登天。'
  },
  {
    id: 'buddhist_03_mangren_moxiang',
    title: '盲人摸象 (The Blind Men and the Elephant - Nirvana Sutra)',
    hskLevel: '2',
    category: 'culture',
    categoryLabel: '佛经寓言 Buddhist Parables',
    summary: 'Each blind man touches a different part of the elephant, mistaking their partial experience for the whole.',
    text: '很久以前，有一位国王召集了一群天生失明的盲人来到王宫，牵来一头高大的大象让他们用手去摸。摸到象牙的盲人说：“原来大象长得像一根光滑坚硬的萝卜！”摸到大象耳朵的盲人争辩道：“不对，大象明明像一把扇风的簸箕！”摸到大象粗腿的盲人喊道：“你们全说错了，大象明明是一根粗壮的柱子！”摸到大象身体的盲人反驳道：“大象明明是一堵高高的墙壁！”摸到大象尾巴的盲人摇着头说：“大象只是一根细细的绳子罢了。”大家争吵不休，互不相让。国王笑着说：“你们每个人摸到的都是大象的一部分，却自以为掌握了大象的全部。”佛陀借此教导弟子：世人看待世间万象，往往执着于自己的片面知见，唯有放下偏执，方能得见圆融真理。'
  },
  {
    id: 'buddhist_04_keshui_yu',
    title: '百喻经之渴见水喻 (Thirsty Man Refusing Water - Baiyu Jing)',
    hskLevel: '2',
    category: 'culture',
    categoryLabel: '佛经寓言 Buddhist Parables',
    summary: 'A parched traveler refuses to drink from a river because he cannot swallow the whole thing.',
    text: '有一个人在酷热的荒漠中跋涉了许久，口干舌燥，痛苦难耐。忽然，他看到前方有一条清澈奔流的大河，河水甘甜清凉。然而，这个人呆呆地站在河岸边，看了很久却一口水也不喝。同行的路人感到非常奇怪，走上前关心地问他：“你既然渴得几乎要倒下，眼前就是清澈的大河，为什么迟迟不低头喝水呢？”这个愚人一本正经地回答：“这条河里的水实在太多太广了！我肚子的容量这么小，根本不可能把整条大河的水一口气喝完。既然喝不完，那我喝它又有什么用呢？”路人听了不禁摇头叹息。许多人在浩瀚的知识与经典面前犹豫不决，总借口学不全而放弃迈出第一步，正如这个守着清泉却甘愿渴死的愚人一样可叹。'
  },
  {
    id: 'buddhist_05_jiuse_lu',
    title: '敦煌鹿王本生：九色鹿的故事 (The Nine-Colored Deer - Dunhuang Jataka)',
    hskLevel: '3',
    category: 'culture',
    categoryLabel: '敦煌壁画 Dunhuang Lore',
    summary: 'The compassionate deer saves a drowning man, who betrays it for reward, teaching karma and fidelity.',
    text: '在古老的恒河边，生活着一头神奇的神鹿。它的毛皮洁白如玉，映照出赤橙黄绿青蓝紫九种绚烂的色彩，被称为九色鹿。一天，山洪暴发，一个名叫调达的男子在滚滚浊流中垂死挣扎，凄厉呼救。九色鹿毫不犹豫跃入惊涛骇浪，拼尽全力将调达背上了岸。调达跪在地上叩头谢恩，发誓终身为奴服侍神鹿。九色鹿温和地劝他回家，只叮嘱他切莫泄露自己的居所。不久，国王的王后梦见九色鹿的锦缎皮毛，重金悬赏：告密者封官赐千金。贪婪的调达立刻撕毁誓言，带领国王的千军万马将九色鹿团团围住。九色鹿从容走向国王御驾，将自己舍命救人却遭背叛的经过娓娓道来。国王羞愧难当，下令全军放箭护卫神鹿，严禁伤害灵物。而见利忘义的调达当场应验毒誓，满身溃烂生疮，遭到了因果报应。'
  },
  {
    id: 'buddhist_06_xinjing',
    title: '般若波罗蜜多心经（玄奘法师译）(The Heart Sutra - Master Xuanzang)',
    hskLevel: '5',
    category: 'culture',
    categoryLabel: '佛门经典 Sacred Scripture',
    summary: 'The foundational 260-character Mahayana scripture on emptiness, non-attachment, and transcendent wisdom.',
    text: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。舍利子，是诸法空相，不生不灭，不垢不净，不增不减。是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法，无眼界，乃至无意识界。无无明，亦无无明尽，乃至无老死，亦无老死尽。无苦集灭道，无智亦无得。以无所得故，菩提萨埵，依般若波罗蜜多故，心无挂碍。无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，能除一切苦，真实不虚。故说般若波罗蜜多咒，即说咒曰：揭谛揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。'
  },
  {
    id: 'buddhist_07_liuzu_tanjing',
    title: '六祖坛经传法偈：菩提本无树 (Platform Sutra - Bodhi Has No Tree)',
    hskLevel: '5',
    category: 'culture',
    categoryLabel: '禅宗公案 Zen Teachings',
    summary: 'The famous verse encounter between Shenxiu and Huineng illuminating sudden enlightenment.',
    text: '唐代禅宗五祖弘忍大师欲传衣钵，命门下诸弟子各作一偈以显心性。首席大弟子神秀在廊下题壁云：“身是菩提树，心如明镜台。时时勤拂拭，勿使惹尘埃。”此偈强调渐修功夫，时刻克制妄念。当时在后院春米的行者惠能听闻此偈，深感尚未彻见本来佛性，遂请人在旁另书一偈云：“菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。”惠能直指心性空寂、不生不灭之本体，万法皆由自性生起，无须刻意执着扫除外相。五祖弘忍夜入碓坊，传以金刚经与祖师衣钵，惠能由此成为禅宗六祖。千百年来，这两首偈颂成为体悟渐修与顿悟、色空不二的无上智慧明灯。'
  },
  {
    id: 'buddhist_08_jingangjing_siju',
    title: '金刚经：一切有为法如梦幻泡影 (Diamond Sutra - Like a Dream or Bubble)',
    hskLevel: '6',
    category: 'culture',
    categoryLabel: '佛门经典 Sacred Scripture',
    summary: 'The supreme four-line gatha from chapter 32 of the Diamond Sutra on the impermanence of conditioned phenomena.',
    text: '姚秦三藏法师鸠摩罗什所译《金刚般若波罗蜜经》，为大乘佛法开启无上解脱法门。经文至第三十二分，佛告须菩提：“若有人以满无量阿僧祇世界七宝持用布施；若有善男子、善女人发菩提心者，持于此经，乃至四句偈等，受持读诵，为人演说，其福胜彼。云何为人演说？不取于相，如如不动。何以故？一切有为法，如梦幻泡影，如露亦如电，应作如是观。”世间所有因缘和合而成的万事万物，皆如梦境虚无，如水泡幻灭，如朝露短暂，如闪电瞬息即逝。参透此四句偈，便能在繁华喧嚣的人生旅途中不生执念、不困于情，常住清净自在之本心。'
  },

  // ==========================================================================
  // SECTION 2: CLASSICAL CHILDREN'S LITERATURE & FAIRY TALES (中国儿童文学与童话名作)
  // ==========================================================================
  {
    id: 'child_01_shenbi_maliang',
    title: '神笔马良 (The Magic Brush Ma Liang - Hong Xuntao)',
    hskLevel: '3',
    category: 'fable',
    categoryLabel: '经典童话 Fairy Tale',
    summary: 'A poor child gifted a miraculous paintbrush uses his art to serve the impoverished against greedy tyrants.',
    text: '从前有个孤儿叫马良，他虽然买不起画笔，却极其痴迷画画。上山打柴时他用树枝在泥沙上画小鸟，河边割草时用草根蘸清水在青石上画游鱼。他的勤奋感动了白胡子老仙人，梦中赠给他一支金光闪闪的神笔。马良醒来一挥笔，画出的公鸡立刻跳下墙头啼鸣，画出的大鱼扑通跃入溪水游动！马良用这支神笔为贫苦村民画耕牛、水车与粮食。村里贪婪的大财主得知消息，强行霸占神笔并关押马良。马良智斗财主，在白墙上画出一望无际的大海与金山，引诱贪婪的财主乘着木船前往。马良几笔画下狂风巨浪，将贪婪的恶徒埋葬在汹涌的大海深处。马良带着神笔走遍天下，用善良与智慧为世间劳苦大众画出温暖与希望。'
  },
  {
    id: 'child_02_daocaoren',
    title: '叶圣陶童话：稻草人（经典节选）(The Scarecrow - Ye Shengtao)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '名家童话 Literary Tales',
    summary: 'Ye Shengtao\'s poignant masterpiece of a kind-hearted scarecrow standing silent vigil over nocturnal fields.',
    text: '在宁静的夜色中，田野里的风景只有尽职尽责的稻草人知道得最清楚。他的骨架是细细的竹枝，肌肉与皮肤是晒干的黄稻草，头戴一顶残破的旧荷叶帽子，手中系着一把破芭蕉扇。他既不像懒散的水牛那样躺着看天，也不像顽皮的小狗到处乱跑，总是静悄悄、直挺挺地站在黑夜的微风里守护着金黄的稻田。稻草人的主人是一位经历坎坷、白发苍苍的老太太。她早年丧夫，唯一的儿子也因病早夭，独自一人在这块薄田里辛勤耕作还清债务。今年稻穗长势喜人，稻草人本以为老太太终于可以露出一丝欣慰的笑容。然而在清冷的月夜里，害虫稻螟悄悄飞落在稻叶上产卵。稻草人急得满身是汗，拼命摇动扇子发出响声，恨不能长出双腿飞去报信，但他的身躯深深扎在泥土之中无法挪动半步。叶圣陶笔下的稻草人以其深沉的博爱与无奈的同情，成为了中国现代儿童文学中最动人的经典形象。'
  },
  {
    id: 'child_03_sange_heshang',
    title: '三个和尚没水喝 (Three Monks - A Fable on Responsibility)',
    hskLevel: '2',
    category: 'fable',
    categoryLabel: '儿童寓言 Children\'s Fables',
    summary: 'One monk carries water, two carry together, but three leave the temple parched until crisis unites them.',
    text: '山上一座小庙里，起初只住着一个小和尚。他每天下山挑水，念经扫地，水缸常满，日子过得自得其乐。后来，庙里来了一个高和尚。两个人都想喝水，但谁也不肯独自下山吃亏，于是商量由两人一起抬水。扁担必须架在中间，稍有偏颇两人便争吵不休。不久，庙里又来了一个胖和尚。三个和尚都想喝水，却互相推诿指责，谁也不肯主动下山挑水。结果几天下来，庙里的水缸干涸见底，连观音菩萨瓶里的杨柳枝也枯萎了。夜深人静时，一只饥饿的老鼠溜出洞打翻了神台上的烛台，庙里瞬间燃起熊熊烈火！火势逼人，三个和尚这才慌了神，争先恐后奔下山提水、抬水、挑水全力灭火。大火扑灭后，三个和尚终于明白了团结协作与各自担当的道理，从此定下规矩轮流挑水，庙里再也不缺水喝了。'
  },
  {
    id: 'child_04_afanti_zhongjinzi',
    title: '阿凡提的故事：沙地种金子 (Afanti - Planting Gold in the Sand)',
    hskLevel: '3',
    category: 'fable',
    categoryLabel: '民间智慧 Folk Wisdom',
    summary: 'The clever folk hero tricks a greedy landlord by promising that gold coins can be planted and grown.',
    text: '贪婪刻薄的巴依老爷平日放高利贷盘剥穷苦乡亲，民怨沸腾。聪明勇敢的阿凡提决心好好教训他一顿。一天，阿凡提扛着铁锹在村外的沙滩上热火朝天地翻土。巴依老爷路过，狐疑地问：“阿凡提，你顶着大太阳在沙堆里忙活什么？”阿凡提神秘地附耳低语：“老爷，我在种金子呢！只要找准沙穴施上秘药，埋下一枚金币，来年就能长出一棵沉甸甸结满金元宝的摇钱树！”财迷心窍的巴依老爷信以为真，迫不及待把家里积攒的数十袋金砖银锭全搬了来，交给阿凡提统统“种”进沙丘。过了大半个月，巴依跑来要收金子，阿凡提却坐在沙堆上痛哭流涕：“哎呀老爷！都怪您前几日上香心不诚，得罪了神明，昨夜一场沙暴，地里的金子全化成盐水渗入地底不见了！”巴依老爷气得七窍生烟却无话可说。而阿凡提早已将这些不义之财分发给了受苦受难的乡亲们。'
  },
  {
    id: 'child_05_cong_baicaoyuan',
    title: '鲁迅回忆散文：从百草园到三味书屋 (From Baicao Garden to Sanwei Study - Lu Xun)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '经典文学 Modern Literature',
    summary: 'Lu Xun’s vivid childhood memories of chasing crickets, winter bird-trapping, and reading with his strict master.',
    text: '我家的后面有一个很大的园，相传叫作百草园。现在是早已并屋子一起卖给朱姓的子孙了，连那最末次的相见也已经隔了七八年，其中似乎确凿只有一些野草；但那时却是我的乐园。不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹；也不必说鸣蝉在树叶里长吟，肥胖的黄蜂伏在菜花上，轻捷的叫天子忽然从草间直窜向云霄里去了。单是周围的短短的泥墙根一带，就有无限趣味。油蛉在这里低唱，蟋蟀们在这里弹琴。冬天的百草园则更有一番情趣：雪一下，闰土的父亲便教我们在空地上支起大竹筛，底下撒下秕谷，远远牵着一根长绳，等那些山雀、麻雀、白颊鸟飞来觅食时轻轻一拉绳子，便能捕获数十只活泼灵巧的鸟儿。后来我要告别这无忧无虑的百草园，去三味书屋跟随严厉的寿镜吾先生读书念经，那份对大自然童真岁月的留恋，化作了一生挥之不去的温馨忆念。'
  },

  // ==========================================================================
  // SECTION 3: FOUR GREAT FOLK LOVE LEGENDS (四大民间传说)
  // ==========================================================================
  {
    id: 'legend_01_baishezhuan',
    title: '白蛇传：断桥借伞与水漫金山 (Legend of the White Snake - Duanqiao & Jinshan)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '四大民间传说 The Great Legends',
    summary: 'The immortal love story of Bai Suzhen, Xu Xian, the umbrella on Broken Bridge, and the flood at Jinshan.',
    text: '千年白蛇白素贞化作端庄温婉的女子，与青蛇小青同游人间胜景西湖。清明时节微雨如酥，在断桥之畔，白素贞偶遇清秀厚道的书生许仙。借伞还伞之间，两人互生爱慕，结为恩爱夫妻，在镇江开设保和堂药铺悬壶济世，深受百姓爱戴。端阳佳节，许仙听信金山寺法海和尚谗言，劝白素贞饮下雄黄药酒。白素贞现出原形吓死许仙。为救夫君性命，白素贞不惜冒死独闯昆仑仙山盗取灵芝仙草，将许仙起死回生。法海心怀偏见，强行将许仙软禁于金山寺中阻断人妖情缘。白素贞与小青率水族兴风作浪、水漫金山以求团聚。虽然因身怀六甲法力不支而败退，但夫妻二人最终在断桥再次相逢，尽释前嫌。白蛇传以其对真挚爱情的不屈坚守与对封建戒律的无畏挑战，成为了千古流芳的浪漫史诗。'
  },
  {
    id: 'legend_02_liangzhu',
    title: '梁山伯与祝英台：十八相送与化蝶 (Butterfly Lovers - Liang Shanbo and Zhu Yingtai)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '四大民间传说 The Great Legends',
    summary: 'Zhu Yingtai disguises as a scholar to study, falls for Liang Shanbo, culminating in the immortal butterfly transformation.',
    text: '古时上虞士族女子祝英台求知若渴，冲破女子不得读书的礼教束缚，女扮男装前往杭州求学。草桥之畔，她与淳朴敦厚的会稽书生梁山伯相遇，义结金兰，同窗共读三载，情同手足。学成返乡之际，梁山伯依依不舍送别十八里路。祝英台一路借景赋诗、托物言志，以水底鸳鸯、双飞白鹅暗喻自己是女儿之身，质朴的梁山伯却始终未解风情。待到梁山伯登门探访，惊见同窗贤弟竟是绝色佳人，两人互许终身。然而祝父已将英台强行许配给官宦恶少马文才。梁山伯忧郁成疾含恨而终。大婚之日，祝英台的花轿行经梁山伯墓前，忽然狂风骤起、飞沙走石，英台抚墓长恸，地动山摇间墓穴豁然洞开。英台义无反顾纵身跃入墓中。俄顷风平浪静，天朗气清，墓中蹁跹飞出一双色彩斑斓的彩蝶，双宿双飞于百花之间，成为了超越生死与世俗枷锁的自由绝唱。'
  },
  {
    id: 'legend_03_niulang_zhinv',
    title: '牛郎织女：天河与七夕鹊桥 (The Cowherd and the Weaver Girl - Qixi Bridge)',
    hskLevel: '3',
    category: 'culture',
    categoryLabel: '四大民间传说 The Great Legends',
    summary: 'The celestial weaver girl and earthly cowherd separated by the Silver River, reunited once a year across the magpie bridge.',
    text: '勤劳善良的孤儿牛郎受尽哥嫂刻薄虐待，分家时只得了一头老黄牛。这头老牛本是天界金牛星下凡，感念牛郎恩情，指引他在碧莲池旁结识了私下凡尘的天帝织女。织女厌倦了天庭冰冷重复的织布劳作，倾心于牛郎的淳朴忠厚，两人结为夫妻，男耕女织，育有一双活泼可爱的儿女，日子过得温馨美满。王母娘娘察觉后勃然大怒，亲率天兵天将降临人间将织女强行捉拿回天。老牛临终前嘱咐牛郎剥下牛皮披在身上。牛郎用竹筐挑着一对儿女，腾云驾雾拼命追赶。眼看就要追上，王母娘娘拔下头上金簪在身后一划，凭空辟出一条波涛汹涌、浩瀚无涯的天河！夫妻母子只能隔岸相望、泣不成声。他们的忠贞深情最终感动了世间千万只喜鹊。每逢农历七月初七，成群结队的喜鹊在银河之上搭起一座飞架南北的鹊桥，让牛郎织女跨越天堑共度良宵。'
  },
  {
    id: 'legend_04_mengjiangnv',
    title: '孟姜女哭长城 (Meng Jiangnü Weeping at the Great Wall)',
    hskLevel: '3',
    category: 'history',
    categoryLabel: '四大民间传说 The Great Legends',
    summary: 'Meng Jiangnü travels thousands of miles to deliver winter clothes to her husband, crying down the Great Wall in sorrow.',
    text: '秦始皇征调天下民夫修建万里长城，关中书生万杞梁（范喜良）与农家姑娘孟姜女新婚仅三日，便被凶悍的官差强行抓走充军发配北疆要塞。秋去冬来，北风刺骨，孟姜女思念丈夫在苦寒关塞衣衫褴褛，日夜赶制了厚实的棉衣，告别双亲，独自踏上了千里送寒衣的坎坷旅途。她翻山越岭，栉风沐雨，历尽千难万险终于抵达雄伟的长城脚下。然而修筑城墙的工役凄楚地告诉她：万杞梁因饥寒交迫与过度劳累，早在数月前便已死在工地，尸骨被直接筑进了冰冷坚硬的城墙砖石之中。闻此噩耗，孟姜女悲痛欲绝，在长城脚下面壁痛哭三天三夜，天地为之动容，凄风苦雨遮蔽天日。轰隆一声巨响，八百里长城在孟姜女的哭声中坍塌崩裂，露出了掩埋在底下的累累尸骨。孟姜女以血泪控诉了暴政徭役的残酷，她的深情与刚烈化作了中华民族不朽的历史传奇。'
  },
  {
    id: 'legend_05_mulan_shi',
    title: '乐府民歌：木兰诗（唧唧复唧唧）(The Ballad of Mulan - Complete Text)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '古典诗篇 Classical Ballad',
    summary: 'The complete Northern Dynasties folk ballad recounting Mulan taking her father’s place in the army for twelve years.',
    text: '唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。旦辞爷娘去，暮宿黄河边，不闻爷娘唤女声，但闻黄河流水鸣溅溅。旦辞黄河去，暮至黑山头，不闻爷娘唤女声，但闻燕山胡骑鸣啾啾。万里赴戎机，关山度若飞。朔气传金柝，寒光照铁衣。将军百战死，壮士十年归。归来见天子，天子坐明堂。策勋十二转，赏赐百千强。可汗问所欲，木兰不用尚书郎，愿驰千里足，送儿还故乡。爷娘闻女来，出郭相扶将；阿姊闻妹来，当户理红妆；小弟闻姊来，磨刀霍霍向猪羊。开我东阁门，坐我西阁床。脱我战时袍，著我旧时裳。当窗理云鬓，对镜帖花黄。出门看火伴，火伴皆惊忙：同行十二年，不知木兰是女郎。雄兔脚扑朔，雌兔眼迷离；双兔傍地走，安能辨我是雄雌！'
  },

  // ==========================================================================
  // SECTION 4: ANCIENT WISDOM, PHILOSOPHY & ALLEGORIES (先秦诸子与经典寓言)
  // ==========================================================================
  {
    id: 'philo_01_zhuangzi_paoding',
    title: '庄子寓言：庖丁解牛 (Zhuangzi - Cook Ding Carving the Ox)',
    hskLevel: '5',
    category: 'culture',
    categoryLabel: '先秦诸子 Daoist Wisdom',
    summary: 'Following the natural grain of life: Cook Ding’s knife remains sharp after nineteen years by moving in harmony with nature.',
    text: '厨师庖丁为梁惠王宰割耕牛。他手所接触的地方，肩膀所倚靠的地方，脚所踩踏的地方，膝盖所顶住的地方，皮肉与筋骨分离发出的哗哗声响，刀刃运走时发出的霍霍音律，无不合乎古老的桑林舞乐与经首节拍。文惠王赞叹道：“善哉！技盖至此乎？”庖丁放下刀，从容回答说：“臣之所好者，道也，进乎技矣。始臣之解牛之时，所见无非牛者；三年之后，未尝见全牛也。方今之时，臣以神遇而不以目视，官知止而神欲行。依乎天理，批大郤，导大窾，因其固然。”一般的良厨一年换一把刀，因为割肉伤刃；平庸的厨师一个月换一把刀，因为硬砍骨头。而庖丁的这把刀使用了整整十九年，宰杀耕牛数千头，刀刃依然像刚在磨刀石上磨出一样锋利光滑。因为牛的骨节骨骼之间有宽阔的缝隙，而刀刃极其薄滑没有厚度。以毫无厚度的刀刃游走于宽绰的缝隙之中，自当游刃有余！梁惠王听罢欣然领悟：“听了庖丁这番高论，我真正懂得了顺应天道、养护生命的无上法则！”'
  },
  {
    id: 'philo_02_zhuangzi_mengdie',
    title: '庄子寓言：庄周梦蝶 (Zhuangzi - The Butterfly Dream)',
    hskLevel: '5',
    category: 'culture',
    categoryLabel: '先秦诸子 Daoist Wisdom',
    summary: 'Was Zhuang Zhou dreaming he was a butterfly, or is the butterfly dreaming it is Zhuang Zhou? The mystery of existence.',
    text: '昔者庄周梦为胡蝶，栩栩然胡蝶也，自喻适志与！不知周也。俄然觉，则蘧蘧然周也。不知周之梦为胡蝶与，胡蝶之梦为周与？周与胡蝶，则必有分矣。此之谓物化。庄子借这则传颂千古的玄妙哲思启迪世人：人们在现实中自以为清醒，区分贫富贵贱、生死得失，然而在浩瀚无垠的天地造化看来，人与天地万物本是息息相通、流转不息的统一整体。究竟是庄周在梦中变成了翩翩起舞的蝴蝶，还是蝴蝶在梦中幻化成了多愁善感的庄周？参透了“物我两忘”的境界，方能在喧嚣红尘中超越执念，获得精神的终极自由与逍遥。'
  },
  {
    id: 'philo_03_saiweng_shima',
    title: '淮南子寓言：塞翁失马，焉知非福 (The Old Man at the Frontier Loses His Horse)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Classic Idiom',
    summary: 'Misfortune turns into fortune, and fortune into misfortune: finding calm equanimity amidst life’s unpredictable changes.',
    text: '古时长城边塞住着一位精通占卜之术的老翁。一天，他家精心饲养的一匹良马无缘无故走失逃入了北方的胡地。邻里街坊闻讯，纷纷赶来安慰他。塞翁却泰然自若微笑着说：“马丢了，这难道就一定不是一件好事吗？”过了几个月，那匹走失的良马不仅自己回来了，还引来了一匹高大神骏的胡地骏马。邻居们都跑来向塞翁道贺。塞翁却皱起眉头说：“白白得了一匹胡马，这难道就一定不会引来灾祸吗？”塞翁的儿子非常喜欢骑马，一天骑着这匹胡地骏马在大漠驰骋，不慎跌落摔断了大腿骨成了跛子。乡亲们又跑来嘘寒问暖，塞翁依然平静地说：“孩子虽然跛了，又怎知不是福气呢？”一年后胡人大规模侵犯边塞，边关所有体魄健全的青年男子全被强征入伍奔赴沙场，战死者十有八九。而塞翁的儿子恰恰因为跛足免于兵役，父子得以在乱世中安然保全性命。'
  },
  {
    id: 'philo_04_shouzhudaitu',
    title: '韩非子寓言：守株待兔 (Waiting by the Stump for a Rabbit)',
    hskLevel: '2',
    category: 'chengyu',
    categoryLabel: '成语寓言 Classic Idiom',
    summary: 'A farmer gives up farming to wait for another rabbit to run into a tree trunk, cautioning against stubborn complacency.',
    text: '宋国有一个农夫，在田里辛勤地耕地。田埂中央有一截露在地面上的枯树桩。有一天，一只慌不择路的野兔从树林中拼命狂奔出来，一头重重撞在坚硬的枯树桩上，折断了脖子当场毙命。农夫白白捡了一只肥嫩的野兔，心里美滋滋的。从此以后，他把手中的锄头扔在一旁，再也不肯下地出力耕作，天天搬个小板凳坐在枯树桩旁边痴痴守候，满心指望能再次捡到撞死在上面的野兔。日子一天天过去，野兔再也没有出现过，而他田里的禾苗全部枯萎荒芜，杂草丛生。这个农夫不但颗粒无收，还成为了全天下人茶余饭后的笑柄。韩非子以此警告治国理政者：时代在不断前进变化，如果死守过去的偶发成规不知变通，下场就和这个守株待兔的农夫一样可悲。'
  },
  {
    id: 'philo_05_lanyu_chongshu',
    title: '韩非子寓言：滥竽充数 (Pretending to Play the Yu in the King’s Orchestra)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Classic Idiom',
    summary: 'A con man pretends to play the flute in a 300-person orchestra until solo auditions are required.',
    text: '战国时期齐宣王极其喜爱听吹竽的宫廷雅乐，而且讲究排场，每次奏乐一定要命三百名乐师同时合奏。南郭先生根本不会吹竽，但他擅长察言观色，便跑到齐宣王面前夸耀自己技艺超群。宣王大喜，收纳他进入乐队，并赐予丰厚的俸禄。每次三百名乐师合奏之时，南郭先生就混在人群中，装模作样地摇头晃脑、鼓起腮帮子捂住琴孔，多年来居然瞒天过海，享受着优厚的赏赐。后来齐宣王去世，儿子齐湣王继承王位。齐湣王同样喜欢听吹竽，但他不爱听大合奏，专门立下规矩：命令乐师们一个接着一个单独进宫演奏给他听！南郭先生听闻此讯吓得魂飞魄散、冷汗淋漓，自知再也混不下去了，连夜收拾包袱灰溜溜地溜出了王宫。这则寓言告诫我们：没有真才实学、单凭虚张声势混日子，一旦面对真本事的检验终将现出原形。'
  },
  {
    id: 'philo_06_zixiang_maodun',
    title: '韩非子寓言：自相矛盾 (The Incompatible Spear and Shield)',
    hskLevel: '2',
    category: 'chengyu',
    categoryLabel: '成语寓言 Classic Idiom',
    summary: 'A merchant claims his shield can withstand anything and his spear can pierce anything, trapping himself in logic.',
    text: '楚国有一个在集市上贩卖兵器的商人。为了招揽顾客，他首先举起手中的盾牌大声夸耀道：“我的这面神盾坚固无比，全天下无论多么锋利的兵器都休想刺穿它！”围观的人群议论纷纷。紧接着，商人又举起手中闪烁着寒光的长矛极力吹嘘道：“我的这根神矛锋利无比，全天下无论多么坚硬的铠甲与厚盾，只要被它一刺立刻洞穿！”人群中有一位老者微笑着走上前去，平静地问道：“如果用你的这根无坚不摧的长矛，去刺你那面无论如何也无法刺穿的坚盾，结果会怎么样呢？”那个商人顿时哑口无言，张口结舌一句话也答不上来。全天下不可能同时存在什么都刺不透的盾与什么都能刺透的矛。说话办事如果前后颠倒脱离客观规律，必然会陷入自相矛盾的尴尬境地。'
  },
  {
    id: 'philo_07_maidu_huanzhu',
    title: '韩非子寓言：买椟还珠 (Buying the Wooden Box and Returning the Pearl)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Classic Idiom',
    summary: 'A customer buys a pearl solely for its elaborate carved wooden case and returns the pearl inside.',
    text: '楚国有一个珠宝商人，想要把一颗名贵的夜明珠拿到郑国去卖个好价钱。为了吸引有钱的买主，商人特意用名贵的木兰木雕刻了一只精美绝伦的木盒子，用珍贵的桂皮与花椒熏染盒体，盒身镶嵌着晶莹剔透的美玉与翡翠，并缀满了闪闪发光的各色宝石。郑国的一个富商走过摊位，被这只流光溢彩的漂亮木盒深深吸引。他毫不犹豫出重金买下了盒子。然而打开盒子后，郑国人小心翼翼地取出里面那颗价值连城的无价宝珠，双手递还给楚国商人说：“我买的是这只美丽的盒子，里面的这颗小石头我用不上，还给你吧！”说罢喜滋滋地捧着木盒扬长而去。这个故事讽刺了那些目光短浅、本末倒置的人：只看重浮华的外在形式，却忽略了真正具有价值的核心内涵。'
  },
  {
    id: 'philo_08_beigong_sheying',
    title: '风俗通义：杯弓蛇影 (Mistaking the Bow’s Reflection for a Snake)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Classic Idiom',
    summary: 'A man falls ill believing he swallowed a snake in his wine glass, cured when shown it was merely a bow’s shadow.',
    text: '晋代河南郡太守乐广生性豁达，待客诚恳。他有一位挚友，平日里常常来家中饮酒赋诗，忽然之间很久不登门拜访了。乐广关心地派人去打听，才知道这位朋友病倒在床，骨瘦如柴。乐广亲自前去探视，询问生病的原由。朋友面露恐惧，颤声说道：“前些日子在您府上饮酒，我举起酒杯，赫然看见酒中游动着一条细小的毒蛇！我当时不便推辞勉强咽了下去，回家后只觉得腹内剧痛难忍，从此卧床不起。”乐广回到家中仔细观察宴厅，发现墙壁正中央悬挂着一把漆有花纹的雕弓，倒映在酒杯里恰似一条蜿蜒的小蛇。乐广再次将朋友请到家中原位设宴，倒满美酒指着杯中倒影让他看，随后当面取下墙上的弓，杯中的“蛇”瞬间消失得无影无踪。朋友恍然大悟，心中的疑虑恐惧顿时烟消云散，多年的顽疾竟不药而愈。'
  },

  // ==========================================================================
  // SECTION 5: HISTORICAL WIT & IMMORTAL PROSE (古典小品文与传世名篇)
  // ==========================================================================
  {
    id: 'lit_01_taohuayuanji',
    title: '陶渊明名篇：桃花源记 (The Peach Blossom Spring - Tao Yuanming)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '魏晋名篇 Classical Utopia',
    summary: 'A fisherman stumbles upon a secluded pastoral utopia free from dynastic warfare and strife.',
    text: '晋太元中，武陵人捕鱼为业。缘溪行，忘路之远近。忽逢桃花林，夹岸数百步，中无杂树，芳草鲜美，落英缤纷。渔人甚异之，复前行欲穷其林。林尽水源便得一山，山有小口仿佛若有光。便舍船从口入。初极狭才通人，复行数十步豁然开朗。土地平旷屋舍俨然，有良田美池桑竹之属。阡陌交通鸡犬相闻。其中往来种作男女衣着悉如外人。黄发垂髫并怡然自乐。见渔人乃大惊，问所从来。具答之。便要还家设酒杀鸡作食。自云先世避秦时乱，率妻子邑人来此绝境不复出焉，遂与外人间隔。问今是何世，乃不知有汉无论魏晋。停数日辞去，此中人语云：“不足为外人道也。”既出得其船便扶向路处处志之。及郡下诣太守，太守遣人随其往寻向所志，遂迷不复得路。陶渊明在此勾勒出超越残酷乱世的千古理想乐土，令人神往不已。'
  },
  {
    id: 'lit_02_lantingji_xu',
    title: '王羲之书法名篇：兰亭集序 (Lantingji Xu - Preface to the Orchid Pavilion Gathering)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '天下第一行书 Calligraphy Masterpiece',
    summary: 'Wang Xizhi’s timeless reflection on spring, friendship, fleeting life, and mortality at the Orchid Pavilion.',
    text: '永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹；又有清流激湍，映带左右，引以为流觞曲水，列坐其次。虽无丝竹管弦之盛，一觞一咏，亦足以畅叙幽情。是日也，天朗气清，惠风和畅。仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱，信可乐也。夫人之相与，俯仰一世。或取诸怀抱，悟言一室之内；或因寄所托，放浪形骸之外。虽趣舍万殊，静躁不同，当其欣于所遇，暂得于己，快然自足，不知老之将至；及其所之既倦，情随事迁，感慨系之矣。古人云：死生亦大矣。岂不痛哉！后之览者，亦将有感于斯文。王羲之将书法之神韵与人生无常之浩叹熔于一炉，铸成了中华文明史上的无上奇珍。'
  },
  {
    id: 'lit_03_qian_chibifu',
    title: '苏轼千古文赋：前赤壁赋（精选）(Su Shi - Former Ode to the Red Cliff)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '宋代散文 Song Literary Giant',
    summary: 'Su Shi floats beneath the moonlit Red Cliff, contemplating the transient nature of mortal heroes vs the eternal cosmos.',
    text: '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。少焉，月出于东山之上，徘徊于斗牛之间。白露横江，水光接天。纵一苇之所如，凌万顷之茫然。客有吹洞箫者，其声呜呜然，如怨如慕，如泣如诉，余音袅袅，不绝如缕。客感叹人生苦短，寄蜉蝣于天地，渺沧海之一粟。苏子曰：“客亦知夫水与月乎？逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也。盖将自其变者而观之，则天地曾不能以一瞬；自其不变者而观之，则物与我皆无尽也，而又何羡乎！且夫天地之间，物各有主，苟非吾之所有，虽一毫而莫取。惟江上之清风，与山间之明月，耳得之而为声，目遇之而成色，取之无禁，用之不竭，是造物者之无尽藏也，而吾与子之所共适。”客喜而笑，相与枕藉乎舟中，不知东方之既白。'
  },
  {
    id: 'lit_04_shishuo_xinyu',
    title: '世说新语名篇：咏雪与绝妙好辞 (A Gathering on a Snowy Day - Shishuo Xinyu)',
    hskLevel: '4',
    category: 'literature',
    categoryLabel: '魏晋风度 Wei-Jin Anecdotes',
    summary: 'Xie Daoyun composes the immortal line "like willow catkins in the wind," capturing the quintessential Wei-Jin wit.',
    text: '南朝宋刘义庆所撰《世说新语》，生动记录了魏晋名士超然脱俗的风雅气度。谢安谢太傅在一个寒冷的下雪天把子侄儿女召集在厅堂中，讲论诗文义理。忽然之间大雪纷飞，太傅高兴地抚须问道：“白雪纷纷何所似？”哥哥的儿子谢朗率先答道：“撒盐空中差可拟。”而才女侄女谢道韫则从容吟咏道：“未若柳絮因风起。”谢安听了抚掌大笑，盛赞其才情高迈。“柳絮因风起”自此成为中国文学史上描绘飞雪最飘逸轻灵的名句。另一则捷悟典故中，曹操与杨修路过曹娥碑下，见碑阴题有“黄绢幼妇，外孙齑臼”八字。曹操思索了三十里路才恍然大悟，杨修早已解出此为“绝妙好辞”四字隐语，曹操不由叹服自愧不如。短小精悍的世说轶事，展现了汉字独特的音韵机敏与士人风骨。'
  },
  {
    id: 'lit_05_rulin_fanjin',
    title: '儒林外史名篇：范进中举（经典精粹）(Fan Jin Passes the Imperial Exam - Wu Jingzi)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '清代讽刺小说 Satirical Masterpiece',
    summary: 'The tragicomic portrait of fifty-year-old scholar Fan Jin losing his senses upon finally passing the provincial exams.',
    text: '清代吴敬梓所著讽刺名著《儒林外史》，深刻揭露了科举制度对文人灵魂的腐蚀。贫困潦倒的穷秀才范进年过五旬，连年应考屡战屡败，受尽了屠户岳父胡屠户的唾骂鄙夷，家里穷得常常揭不开锅。这一年范进瞒着岳父参加乡试，放榜之日，范进正抱着一只骨瘦如柴的生蛋老母鸡在集市上换米度日。忽然敲锣打鼓声震天动地，报录人快马飞驰而至，高喊：“贵府范老爷高中第七名亚元！”范进回家接过报帖仔细看了一遍，拍着双手大笑道：“噫！好了！我中了！”说罢往后一仰跌倒在地，不省人事。待灌下几口冷水醒转过来，范进依然疯疯癫癫拍手大叫着“中了中了”往门外飞跑，头发散乱跌入泥塘里。众邻里只得请来平日最具威严的胡屠户，狠狠扇了他一个耳光，才把范进打醒。方才百般侮辱他的岳父与乡绅，此时却满面堆笑送银送房争相巴结。吴敬梓以辛辣而深沉的笔触，铸就了讽刺文学史上永恒的里程碑。'
  }
];
