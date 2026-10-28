/** Keyword replies for free-typed WeChat chats. A match answers without advancing the story lines. */
export interface KeywordRule {
  keys: string[];
  reply: string;
}

const sehun: KeywordRule[] = [
  { keys: ["几岁", "多大", "年龄", "岁数", "몇 살", "나이"], reply: "스물셋이요. 누나보다 어린 거 알아요… 그래도 애 취급은 하지 마요.\n（二十三岁。我知道比姐姐小……但别把我当小孩。）" },
  { keys: ["生日", "생일", "几号出生"], reply: "4월 12일이요. 누나 폰 비밀번호도 0412잖아요, 일부러 그런 거죠?\n（4月12日。姐姐手机密码也是0412，是故意的吧？）" },
  { keys: ["身高", "多高", "키"], reply: "183이요. 누나 정수리 내려다보기 딱 좋은 키.\n（183。刚好能低头看姐姐头顶的身高。）" },
  { keys: ["血型", "혈액형"], reply: "O형이요.\n（O型。）" },
  { keys: ["哪里人", "老家", "家乡", "고향"], reply: "서울이요. 서울 토박이.\n（首尔，土生土长的首尔人。）" },
  { keys: ["名字", "本名", "이름"], reply: "오세훈. 누나는 그냥 세훈이라고 불러요.\n（吴世勋。姐姐就叫我世勋吧。）" },
  { keys: ["队长", "担当", "位置", "포지션"], reply: "EXO 막내, 메인 댄서랑 래퍼, 그리고 비주얼이래요ㅋㅋ\n（EXO忙内，主舞和Rapper，还有门面哈哈。）" },
  { keys: ["出道", "데뷔"], reply: "2012년 4월에 데뷔했어요. 그때 누나 봤으면 좋았을 텐데.\n（2012年4月出道的。那时候要是认识姐姐就好了。）" },
  { keys: ["喜欢吃", "爱吃", "好吃", "吃什么", "음식"], reply: "치킨이랑 버블티! 누나가 사주면 더 맛있어요.\n（炸鸡和珍珠奶茶！姐姐请的更好吃。）" },
  { keys: ["狗", "宠物", "Vivi", "비비"], reply: "비비 보고 싶다… 다음에 누나도 같이 산책 가요.\n（想Vivi了……下次姐姐也一起去遛狗吧。）" },
  { keys: ["喜欢我", "爱我", "喜欢谁", "좋아해"], reply: "…그걸 꼭 말로 해야 알아요? 누나 진짜 둔하다.\n（……这还非得说出来才知道吗？姐姐真迟钝。）" },
  { keys: ["累", "辛苦", "困", "피곤"], reply: "누나 오늘도 고생했어요. 일 그만하고 빨리 자요, 명령이에요.\n（姐姐今天也辛苦了。别工作了快睡，这是命令。）" },
  { keys: ["想你", "보고 싶"], reply: "…나도요. 지금 데리러 갈까요?\n（……我也是。现在去接你？）" },
  { keys: ["弟弟", "小孩", "忙内", "막내"], reply: "누나 앞에선 막내 말고 남자로 봐줘요.\n（在姐姐面前别把我当忙内，当男人看。）" },
  { keys: ["晚安", "잘 자"], reply: "누나도 잘 자요. 꿈에 나와요.\n（姐姐也晚安。要梦到我。）" },
  { keys: ["早安", "早上好", "좋은 아침"], reply: "누나 굿모닝! 아침은 먹었어요?\n（姐姐早！吃早饭了吗？）" },
];

const rules: Record<string, KeywordRule[]> = { 世勋: sehun };

/** The keyword reply for this thread's message, or undefined when nothing matches. */
export function keywordReply(thread: string, text: string): string | undefined {
  const t = text.toLowerCase();
  return rules[thread]?.find((r) => r.keys.some((k) => t.includes(k.toLowerCase())))?.reply;
}
