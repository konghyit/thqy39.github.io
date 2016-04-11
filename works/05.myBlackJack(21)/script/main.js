var blackjack = 0;
var scale = 1;
var over = 0;

 /* realSend()
  * 函数功能：1.通过getPorker()、getPorkerPos()获得初始化好的扑克牌位置来模拟真实发牌动作，
  *         并进行相关的dom操作html以完成真实发牌动作。
  *         2.如果一开始两张牌为1和10则为黑杰克。
  *         3.如果2号玩家拥有黑杰克而庄家没有则筹码翻倍。
  *         4.根据count[id].sum > 21与否对lose()进行传递id以获得相应提示。
  */        
function realSend(id) {
    var card = getPorker();
    var cardp = getPorkerPos(card);
    var pos = cardp.X + 'px ' + cardp.Y + 'px';
    var node = document.getElementById('p_' + id);
    var newNode = document.createElement('div');

    if (id == 1 && count[1].count == 1) {
        /* 庄家第二章暗牌 通过属性k, v来实现明牌和计算 */
        newNode.className = "send-card" + id + " card-hidden";
        newNode.setAttribute('k', pos);
        newNode.result = function() {
            this.className = "card";
            this.style.backgroundPosition = this.getAttribute('k');
        }
    } else {
        newNode.className = "send-card" + id + " card";
        newNode.style.backgroundPosition = pos;
    }
    if (count[id].count == 1)
        newNode.setAttribute('v', card.value);
    node.appendChild(newNode);

    ++count[id].count;
    /* 对A单独处理 */
    if (card.value != 1) {
        if (card.value > 10)
            count[id].sum += 10;
        else
            count[id].sum += card.value;
    } else ++count[id].A;

    var ai = count[1];
    var pl = count[2];
    if (pl.A == 1 && pl.count == 2 && pl.sum == 10)//如果一开始两张牌为1和10则为黑杰克。
        blackjack = 1;
    if (blackjack == 1 && ai.A != 1 && ai.count != 2 && ai.sum != 10)
        scale = 2;   //如果2号玩家拥有黑杰克而庄家没有则筹码翻倍。

    /* 先判定是否已经结束 否则调用机器人函数 */
    if (count[id].sum > 21)
        lose(id);
    else if (count[id].sum + count[id].A > 21)
        lose(id);
    else if (id != 1 && count[2].count > 2)
        AI();
}
noneed = 0; //是否触发AI();
 /* AI()
  * 函数功能：当sendCard()触发AI执行逻辑:
  *         若1号电脑拿牌总和小于16或者A牌经过getMax()智能处理后依旧小于16时，
  *         执行realSend(1)以继续要牌，这是一个智能判断，增加了游戏的可玩性。
  *         同时配合动画删除发牌区中的待发牌，然后一张随机抽取的牌显示在相应的位置。
  */
function AI() {
    if (noneed)
        return;
    if (count[1].sum + count[1].A < 16 || getMax(1) < 16) {
        realSend(1);
        setTimeout(function() {
            var n = document.getElementById('p_1').getElementsByClassName('send-card1');
            if (n.length > 0)
                n[0].classList.remove('send-card1');
        }, 800);
    } else
        noneed = 1;
}

/* lose()
 * 函数功能：1.接受传入的id参数，以衔接弹窗提示判断输赢。      
 *         2.根据不同情况，编写不同的获胜提示，以二号玩家为操作玩家的角度提示。         
 */
function lose(id) {
    over = 1;
    /* 采用异或不用判断 */
    count[id].point -= 10 * scale;
    count[id ^ 3].point += 10 * scale;
    /* 刷新点数 */
    document.getElementById('player1').getElementsByClassName('point')[0].innerHTML = count[1].point;
    document.getElementById('player2').getElementsByClassName('point')[0].innerHTML = count[2].point;
    console.log(id + ' lose');
    if (count[1].sum > 21) {
        alert('恭喜：您获胜了：' + id + '号电脑：爆掉了！');
        id = null;
    } else if (count[2].sum > 21) {
        alert('啊！哦！很遗憾：您爆掉了！');
        id = null;
    } else if (count[1].sum == count[2].sum) {
        alert('啊！哦！这把平局！');
        id = null;
    }
    if (id == 1) {
        alert('恭喜：您获胜了！');
    } else {
        alert('很遗憾：您输了。。。');
    }
}
/* getMax()
 * 函数功能：在sendCard中调用，为的是实现每次传入id值算总和时智能判定将A算作1或者11，获得最大的优势。
 *         如果把A算作11大于21,则将其算为1，否则，算11。
 *         随后返回sum。                
 */
function getMax(id) {
    var sum = count[id].sum;
    for (var i = 0; i < count[id].A; ++i) {
        if (sum + 11 > 21)
            sum += 1;
        else
            sum += 11;
    }
    return sum;
}
/* showCard()
 * 函数功能：1.实现了防治未开始游戏便点击亮牌的错误逻辑
 *         2.实现了亮牌后的一系列函数动作:
 *         getMax()、alert(count[id].sum)、lose()（已分别解释）
 *         以及根据结果判断输赢并弹出提示。        
 */
function showCard() {
    if (begain == 0) {} else {
        var hidden = document.getElementById('p_1').getElementsByClassName('card-hidden')[0];
        if (typeof(hidden) != "undefined")
            hidden.result();
        if (over)
            return;

        count[1].sum = getMax(1);
        count[2].sum = getMax(2);

        alert('(1号电脑：' + count[1].sum + ') vs (' + '2号：您' + count[2].sum + ')');
        if (count[1].sum > count[2].sum)
            lose(2);
        else if (count[1].sum < count[2].sum)
            lose(1);
        else {
            console.log('pace');
            over = 1;
        }
    }
}

var begain = 0; //防止没开始游戏直接点击要牌和亮牌的按钮

/* sendCard()
 * 函数功能：1.利用num来实现第一次发牌为一人两张，第二次开始皆为一张。
 *         2.使用setTimeout函数来实现一次性的定时操作：
 *           使得在动画结束后的已设定的时刻，依次调用realSend()函数以衔接发牌动作。
 *         3.实现了防止未开始游戏便点击亮牌的错误逻辑：
 *             新游戏开始调用sendCard(id)则begain++，
 *             若未执行此处，则要牌和亮牌均无法执行。
 */
function sendCard(id) {
    begain++;
    if (over)
        return;

    var num = 1;
    // 一号电脑
    if (count[1].count == 0) {
        num = 2;
        //AI
        for (var i = 0; i < num; ++i) {
            setTimeout(function() {
                realSend(1)
            }, i * 100);
            setTimeout(function() {
                var n = document.getElementById('p_1').getElementsByClassName('send-card1');
                if (n.length > 0)
                    n[0].classList.remove('send-card1');
            }, i * 100 + 800);
        }
    }
    // 2号玩家：您
    for (var i = 0; i < num; ++i) {
        setTimeout(function() {
            realSend(2)
        }, num * 150 + i * 100);
        setTimeout(function() {
            var n = document.getElementById('p_2').getElementsByClassName('send-card2');
            if (n.length > 0)
                n[0].classList.remove('send-card2');
        }, num * 150 + i * 100 + 800);
    }
}
// SUITS：枚举，根据图片分配好4行，低下就是方便循环赋值
var SUITS = {
    HEARTS: 2,
    CLUBS: 1,
    DIAMONDS: 0,
    SPADES: 3,
}
var SUITS_TRANS = {
    0: SUITS.HEARTS,
    1: SUITS.CLUBS,
    2: SUITS.DIAMONDS,
    3: SUITS.SPADES,
}

var porker = new Array();

// 玩家信息
var count = {
    1: {
        count: 0,
        sum: 0,
        A: 0,
        point: 1000
    },
    2: {
        count: 0,
        sum: 0,
        A: 0,
        point: 1000
    },
};
init(); //初始化游戏

//初始化计算所有牌的坐标，用时只取，显得简洁。
var porkerPos = new Array();
for (var i = 0; i < 52; ++i) {
    porkerPos[porker[i].suit.toString() + porker[i].value.toString()] = {
        X: -61.7 * (porker[i].value - 1),
        Y: 85.3 * (porker[i].suit - 1)
    }
}

/* getPorker()
 * 函数功能：1.抽牌函数。
 *         2.每次从开局时定义好的52个数的数组中不放回（porker.pop();）抽牌。
 *         3.返回tmp关联数组供getPorkerPos调用。
 */
function getPorker() {
    if (porker.length > 0) {
        var i = Math.floor(Math.random() * porker.length);
        var tmp = {
            suit: porker[i].suit,
            value: porker[i].value
        };
        porker[i].suit = porker[porker.length - 1].suit;
        porker[i].value = porker[porker.length - 1].value;
        porker.pop();
        return tmp;
    }
}

// 获取背景坐标
function getPorkerPos(tmp) {
    // console.log(tmp.value);
    return porkerPos[tmp.suit.toString() + tmp.value.toString()];
}
/* init()
 * 1.初始化游戏，将候牌区的清空并替换成玩家编号提示。
 * 2.重置blackjack，scale，over值。
 */
function init() {
    count[1].count = count[1].sum = count[1].A = 0;
    count[2].count = count[2].sum = count[2].A = 0;
    for (var i = 0; i < 52; ++i)
        porker[i] = {
            value: i % 13 + 1,
            suit: SUITS_TRANS[Math.floor(i / 13)]
        };
    document.getElementById('p_1').innerHTML = '<p style="color: white">1号玩家</p>';
    document.getElementById('p_2').innerHTML = '<p style="color: white">2号：您</p>';

    blackjack = 0;
    scale = 1;
    over = 0;
}

// 玩家操作按钮:
// 给［新局］按钮 添加点击初始化（洗牌）并发牌功能
var btnSend = document.getElementById("btnSend");
    btnSend.onclick = function() {
        init();
        sendCard();
    }
// 给［要牌］按钮 添加点击发牌功能
var addCard = document.getElementById("addCard");
    addCard.onclick = function() {
        if (begain == 0) {} else {
            sendCard();
        }
    }
// 给［亮牌］按钮 添加亮牌并比较的功能
var showCardBtn = document.getElementById("showCard");
    showCardBtn.onclick = function() {
        if (begain == 0) {} else {
            showCard();
        }
    }
// 给［退出］按钮 添加点击发牌功能
var exit = document.getElementById("exit");
    exit.onclick = function() {
        if (confirm("您确定要退出游戏吗？")) {
            window.close();
        }
    }
var addTip = document.getElementById("btnSend");
    addTip.mouseover = function() {
    var tip = document.createElement("p");
    tip.innerHTML = 'wooo';
    addTip.appendChild(addTip);
}