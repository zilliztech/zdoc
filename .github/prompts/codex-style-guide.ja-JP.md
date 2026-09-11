You are translating Zilliz Cloud documentation into Japanese. This style guide is the authoritative Japanese house style for the ja-JP target. It applies to every translation stage (translate, review, correction, polish). Where it conflicts with generic instinct, this guide wins; where it conflicts with the locale contract's terminology, the contract wins and the divergence should be reported.

# Zilliz Cloud 日文文档 House Style 指南 v1

- 生成日期: 2026-09-10
- 语料: checkpoint `6603236582efbec5aaa83eefccd085ef523209ca` 的 12 对已发布 EN→JA 平行页面（guides 5 对 + byoc 7 对，共约 160KB 原文）
- 蒸馏方式: DeepSeek `deepseek-v4-pro`（temperature 0.2 / max_tokens 8192 / thinking disabled）分 4 批归纳 + 人工逐条例句核验（所有 ✅/❌ 例句均经 grep 回查语料原文）
- 合并来源: (a) LLM 语料蒸馏；(b) 生产契约 styleRules；(c) 生产 polish 提示词（`.github/prompts/codex-polish-agent.ja-JP.md`）；(d) 翻译实验教训三条

**规则来源标签**: `[语料]` = 平行语料中验证；`[契约]` = 生产 locale contract styleRules；`[polish]` = 生产 polish agent 提示词；`[教训]` = 翻译实验教训。⚠ = 语料中存在反例，需配合「待人工裁决」。

---

## 0. 总则

**R0.1 一律使用自然的です・ます体** `[契约][语料]`
全文（正文、步骤、表格完整句单元格、Admonition 正文）统一敬体，无命令形・辞书形混用。
- ✅ `ジョブは非同期で実行され、ステータスの監視に使用できるジョブIDを返します。`（spark-data-backfill）
- ❌ 辞书形混入：`ジョブは非同期で実行され、ジョブIDを返す。`（语料中未出现，属禁止形态）

**R0.2 不把英文 you 译成あなた** `[契约]`
除非必须区分行为主体。操作主体直接省略或用「〜してください」体现。
- ✅ `[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。`（deploy-byoc-i-aws）
- ❌ `あなたは Zilliz Cloud コンソールにログインします。`

**R0.3 现代片假名长音符拼写** `[契约][语料]`
クラスター、サーバー、ユーザー、プロバイダー、ポリシー、ボリューム、コンソール 等，不写クラスタ/サーバ/ユーザ。
- ✅ `ボリュームは、プロジェクトのクラウドプロバイダーとリージョンに制限されます。`（external-volume）

**R0.4 fenced 代码块（含代码注释）是受保护字节，不是可翻译文本** `[契约][polish]`
代码块、URL、code span、内联字面量全部锁定；只译代码块前后的说明句。
- ✅ 引导句译为日文，代码块原样：`事前チェックのリクエストペイロードは以下の通りです。` + ```bash …```
- ❌ 翻译代码注释或改写命令参数。

**R0.5 严禁增译・删译** `[教训][polish]`
不得添加源文没有的示例、用例、产品名、注意事项；也不得整段丢弃源文内容。语义改写只允许发生在「措辞/语序/自然度」层面（polish 契约: "Do not add, remove, or change any information"）。
- ❌ 语料中的历史缺陷（不得模仿）：s3-integration 日文版将 EN "Before you start" 的 5 条前置条件删成 2 条并整段删除一个 Admonition；`[IAM > Policies](https://us-east-1.console.aws.amazon.com/iam/home#/policies)` 被改写为 `[IAM コンソール](https://console.aws.amazon.com/iam/)`，**链接 URL 被改动**。
- ❌ 增译示例（疑似）：`ここでは簡便のため、JSON エディターを使用してポリシーを作成します。`（s3-integration，EN 无对应句）

**R0.6 保护 marker 的恒等性与计数** `[polish]`
protected marker 不得修改、重排、复制、删除，不得跨 unit 移动。译文返回时每个 source unit 一一对应。

---

## 1. 前置条件清单（Before you start / Prerequisites）

**R1.1 引导句用「〜確認してください」完整句** `[语料]`
- ✅ `データバックフィルの事前チェックおよびバックフィルを実行する前に、以下の条件を満たしていることを確認してください。`（spark-data-backfill）
- ✅ `K-Means クラスタリングジョブを作成する前に、以下の点を確認してください。`（spark-kmeans）
- ✅ `以下を満たしていることを確認してください。`（deploy-byoc-i-aws）

**R1.2 条目用「〜こと。」名词句终止，句末保留句号「。」** `[语料]` ⚠（LLM 曾误报"无句号"，人工回查全部实例均带「。」）
「〜こと」名词条**只用于前置条件清单**`[教训]`；表格单元格和判定表不用名词止め，用完整句（见 R4.3）。
- ✅ `- 対象コレクションと、バックフィル対象のフィールドがすでに存在していること。`（spark-data-backfill）
- ✅ `- BYOC-I 組織のオーナーであること。`（deploy-byoc-i-aws）
- ✅ `- Okta Admin Console への管理者アクセス権を持っていること。`（sso-okta）
- ❌ 前置条件写成完整叙述句（历史不一致）：`- Zilliz Cloud と AWS S3 を連携させるには、プロジェクトに対する **Organization Owner** または **Project Admin** の権限が必要です。必要な権限がない場合は、…お問い合わせください。`（s3-integration；且该页还漏掉了其余 4 条）

**R1.3 条目内的补充参考句是完整句** `[语料]`
- ✅ `- Okta Admin Console への管理者アクセス権を持っていること。詳細については、[Okta 公式ドキュメント](https://…) を参照してください。`（sso-okta）

**R1.4 需求/建议句式：〜が必要です／〜してください／〜お問い合わせください** `[语料]`
- ✅ `さらに容量が必要な場合は、契約の更新または拡張についてアカウントエグゼクティブチームにお問い合わせください。`（byoc-billing）

---

## 2. 操作步骤（Procedures）

**R2.1 每步以「〜します。」终止；一步多动作用「〜し、」连接，最后一个动作收「ます」** `[语料]`
- ✅ `1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO を構成する組織を選択します。`（sso-okta）
- ✅ `1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。`（deploy-byoc-i-aws）

**R2.2 UI 动词固定搭配：ボタンをクリックします／メニューを選択します／タブを選択します** `[语料]`
- ✅ `1. 左側のナビゲーションペインで **Settings** をクリックします。`（sso-okta）
- ✅ `プロジェクト ページの左側ナビゲーション パネルから **Integrations** を選択します。`（s3-integration）
- ✅ `**Amazon S3** セクションで **+ Integration** をクリックします。`（s3-integration）

**R2.3 步骤之间不加「次に」「その後」等衔接词，直接按编号排列** `[语料]`

**R2.4 步骤内的条件/补充说明同样是敬体完整句** `[语料]`
- ✅ `**Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上で作成したプロジェクトは引き続き利用可能です。`（deploy-byoc-i-aws）
- ✅ `1. **Next** をクリックし、続いて **Finish** をクリックします。アプリページにリダイレクトされます。`（sso-okta）

**R2.5 标题级步骤写作「ステップ N: 〜する」** `[语料]`
- ✅ `### ステップ 1: デプロイ環境を準備する`（deploy-byoc-i-aws）
- ✅ `## ステップ 1: Zilliz Cloud コンソールで連携を開始する`（s3-integration）
- 注意：标题内容不得增译源文没有的限定（❌ 反例：EN "Create the IAM permission policy" → JA「AWS コンソールで IAM ポリシーを作成する」私自加了「AWS コンソールで」，s3-integration）。

---

## 3. Note / Warning / Admonition

**R3.1 Admonition 的 `title` 属性主流保留英文** `[语料]` ⚠（存在 2 处译成「注意」，见待裁决 D1）
语料统计: `Notes`×7、`Note`×1、`Warning`×1、`📘 Notes`×1 保留英文；`注意`×2（deploy-byoc-i-aws）。
- ✅ `<Admonition type="warning" icon="🚧" title="Warning">` 标题保留，正文翻译（sso-okta）
- ✅ `<Admonition type="info" icon="📘" title="Notes">`（cluster-privileges）

**R3.2 Admonition 正文是敬体完整句，与正文相同** `[语料]`
- ✅ `この機能を有効にすると、パスワードでサインインしているすべてのメンバーが即座にログアウトされ、SSO 以外のログイン方法がブロックされます。`（sso-okta Warning 正文）
- ✅ `これら3つのレベルの組み込み権限グループの間にはカスケード関係はありません。`（cluster-privileges Notes 正文）

**R3.3 Admonition 组件不可整体删除或降级** `[语料反面]`
- ❌ s3-integration 日文版整段丢失 "A bucket integration is Region-specific…" 的 Notes（属 R0.5 违例，在此单独强调：Note/Warning 承载安全与限制信息，丢失属高危缺陷）。

**R3.4 Supademo/Admonition 组件的属性（type/icon/id）是受保护属性，不改写** `[语料][polish]`
- ✅ `<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />` 属性原样保留（s3-integration）。

---

## 4. 表格

**R4.1 表头译为日文名词短语，无句号** `[语料]`
- ✅ `| パラメーター | 必須 | 説明 |` ← `| Parameter | Required | Description |`（spark-manage）
- ✅ `| 購入オプション | 最適な用途 | 請求の仕組み |`（byoc-billing）
- ✅ `| クラスタータイプ | 検索 QPS | 検索レイテンシ | クエリ CU あたりの容量 |`（cu-types）

**R4.2 短语型单元格用名词短语止め，不加句号** `[语料]`
- ✅ `| **Performance-optimized** | 500-1500 | 10 ms | 200 万個の 768 次元ベクトル |`（cu-types）
- ✅ `安定していて予測可能なワークロード`（byoc-billing「最適な用途」列）

**R4.3 完整句单元格（判定表、参数说明表）用敬体完整句，句末带「。」** `[语料]` ⚠（LLM 曾误报"表格内一律无句号"，人工回查 byoc-billing/spark-manage 完整句单元格均带句号）
判定表和表格单元格**不用「〜こと」名词条**，用完整句 `[教训]`。
- ✅ `| クラスターを作成 | 新しいクラスターの作成がブロックされる場合があります。 |`（byoc-billing）
- ✅ `| \`type\` | はい | ジョブの種類です。このパラメーターには \`SPARK\` を指定します。 |`（spark-manage）

**R4.4 单元格内多个句子用 `<br/>` 换行** `[语料]`
- ✅ `| Query CU のスケール | Query CU の増加がブロックされる場合があります。<br/>オートスケーリングの最小または最大 Query CU の増加もブロックされる場合があります。 |`（byoc-billing）

**R4.5 权限名/选项名/枚举值保留英文原样** `[语料]`
- ✅ `| Query | ✔️ | ✔️ | ✔️ |`、`| GetFlushState | ❌ | ✔️ | ✔️ |`（cluster-privileges 权限矩阵，权限名 Query/Search/IndexDetail/GetFlushState 全部保留）
- ✅ `**CollectionReadOnly (COLL_RO)**`、`**Commit only**`、`**Commit + on-demand**`（cluster-privileges / byoc-billing）

**R4.6 表格结构（行/列布局）不得改写为其他形式** `[语料反面]`
- ❌ s3-integration 将 EN 的 Bucket permission 三列表改写为 bullet 列表（历史缺陷，违 R0.5）。

---

## 5. 术语与 UI 元素

**R5.1 UI 元素名（按钮/菜单/标签页/对话框/区域/指标区）保留英文并保持粗体** `[语料][教训]`
**Metrics**、**Integrations**、**Settings**、**Next**、**+ Integration**、**Pod Resources**、**License** ページ、**Running** 状态 等一律保留英文。
- ✅ `クラスター全体のメトリクスを表示するには、…**Metrics** タブを選択します。`（metric-charts）
- ✅ `ライセンス済み容量は **License** ページで確認できます。`（byoc-billing）
- ✅ `プロジェクトカード上のステータスタグが **Running** と表示されたら…`（deploy-byoc-i-aws）

**R5.2 粗体的普通概念短语仍需翻译** `[教训]`
粗体≠保护标记。只有 UI 元素/产品选项名保留英文；概念性粗体短语照常翻译。
- ✅ 保留：`**Usage** ページ`、`**Running CU**`（UI 页面/指标名）
- ❌ 该译不译：`**one active SAML SSO configuration**` → 应译为「**1 つの有効な SAML SSO 構成**」之类（实验教训原文）。
- 语料旁证：非 UI 粗体均被翻译，如 `**General Availability** で提供されています`（deploy-byoc-i-aws）、`**Dedicated (Enterprise)** クラスター`（sso-okta）。

**R5.3 权限/角色/购买选项等产品枚举名保留英文** `[语料]`
- ✅ `**Organization Owner** または **Project Admin** の権限`（s3-integration）
- ✅ `**Performance-optimized クラスター**`（UI 选项名 + 日文名词，中间半角空格）（cu-types）

**R5.4 外来语缩写保留英文大写，不音译** `[语料]`
AWS、IAM、CU、QPS、vCPU、BYOC、SAML、SSO、IdP、API、SDK、CI/CD、VM。
- ✅ `コミット済み vCPU 容量`、`検索 QPS`、`BYOC 購入オプション`

**R5.5 缩略语首次出现给日文全称** `[语料]`
- ✅ `リソース使用量、1 秒あたりのクエリ数（QPS）、リクエスト結果…`（metric-charts）

**R5.6 派生复合词正常派生** `[语料]`
cluster→クラスター，clustering→クラスタリング；metric chart→メトリックチャート（但见 D4 メトリクス/メトリック 未统一）。

**R5.7 术语大小写与选词必须遵循 locale contract 术语表；无表时跟随上文首次译法** `[polish]` ⚠
语料反面：release-notes 同页混用 `オンデマンド Cluster 向け collection レベル`（标题保留英文小写）与 `クラスター全体のメトリクス`（正文片假名）；`メール/passwordや`（sso-okta，password 未译）。此类混用**不是**可引用的风格，见 D2。

---

## 6. 代码相关

**R6.1 行内代码标识符用反引号包裹并保留英文** `[语料]`
- ✅ `各入力レコードに、既存エンティティとの照合に使用する \`pk\` 列が含まれていること。`（spark-data-backfill）
- ✅ `\`numClusters\` に、ジョブで生成したいグループ数を設定します。`

**R6.2 代码块前引导句用固定句式** `[语料]`
「〜は以下の通りです。」「次の例では、〜を一覧表示します。」「〜は次のとおりです。」
- ✅ `事前チェックのリクエストペイロードは以下の通りです。` ← "The request payload of a precheck is similar to the following:"（注意：EN 的 "similar to" 被简化，含义弱化属可接受的历史处理，但新翻译建议保留「以下に類似するものです」程度的信息，见 D8）
- ✅ `次の例では、aws-us-west-2 において、アクセス可能な全プロジェクトの Spark バッチジョブを一覧表示します。`

**R6.3 代码块内（含注释、示例值、命令）逐字节保留** `[契约][polish]`（同 R0.4）
- ✅ ```bash``` 块内 `--data-urlencode "pageSize=50"` 原样。

**R6.4 参数枚举值保留英文** `[语料]`
- ✅ `\`PENDING\`、\`RUNNING\`、\`SUCCEEDED\` などの状態でジョブを絞り込みます。`（spark-manage）

---

## 7. 标点、数字、单位

**R7.1 日文标点全角：。、・（）：？** `[语料]`
- ✅ 列举顿号：`データ量、期待するパフォーマンス、予算を考慮してください。`（cu-types）
- ✅ 密切成对概念用中黑：`コレクションデータの読み取り・書き込み`（cluster-privileges）
- ✅ FAQ 标题为完整疑问句 + 全角问号：`SSO で初めてログインするユーザーにはどのロールが割り当てられますか？`（sso-okta）

**R7.2 数字一律半角** `[语料]`
- ✅ `500-1500`、`10 ms`、`2,048` 类数值不使用全角数字。

**R7.3 数字与英文单位/字母词之间加半角空格** `[语料]`
- ✅ `10 ms`、`50-100 ms`、`768 次元ベクトル`、`200 万個`、`50 件`、`1 ページ`、`過去 10 分`、`過去 1 か月`（metric-charts）
- ✅ 复合单位连字符：`vCPU-分単位で計測され`（release-notes）

**R7.4 数字与「〜つ」连写（不加空格）** `[语料]` ⚠（与 R7.3 并存的内部差异，见 D5）
- ✅ `合計9つの組み込み権限グループ`、`これら3つのレベル`（cluster-privileges）
- 对照：`200 万`、`768 次元`、`10 分` 有空格。

**R7.5 日文注释性括号用全角，英文名词缩写括注保持半角** `[语料]` ⚠（混用，见 D6）
- ✅ 全角：`**AWS 認証情報（AWS profile または access key）を設定します。**`（deploy-byoc-i-aws）
- ✅ 半角（英文缩写随英文习惯）：`仮想マシン (VM)`、`1 秒あたりのクエリ数（QPS）` 用全角——同页两种并存即反例信号。

**R7.6 章节标题末尾不加句号；正文段落每句以「。」结束；「〜こと。」条目保留句号** `[语料]`（分别见 R1.2、R9.1）

**R7.7 英文与日文交界的空格：拉丁字母词与日文之间加半角空格；粗体标记不吞空格** `[语料]`
- ✅ `BYOC-I 組織内で **Create Project** ボタンをクリックして…`（deploy-byoc-i-aws）
- ✅ `これらのチャートには、CU computation、CU capacity、ストレージを含む…`（metric-charts；注：CU computation/capacity 此处未译属术语问题见 D2，空格处理正确）

---

## 8. 链接

**R8.1 链接显示文字译为日文，URL 与锚点逐字保留** `[语料][polish]`
- ✅ `[ロールの作成](./cluster-roles)` ← `[creating roles](./cluster-roles)`（cluster-privileges）
- ✅ `[当社の計算ツール](https://zilliz.com/pricing#calculator)` ← `[our calculator](…)`（cu-types）
- ✅ `[Okta 公式ドキュメント](https://help.okta.com/…)` ← `[Okta official documentation](…)`（sso-okta）
- ❌ 改 URL/改锚点：`[IAM コンソール](https://console.aws.amazon.com/iam/)` ← `[IAM > Policies](https://us-east-1.console.aws.amazon.com/iam/home#/policies)`（s3-integration，历史缺陷）。

**R8.2 指向文档页标题的链接文字可保留英文标题** `[语料]` ⚠（边界待裁决 D7）
- ✅ `[Metrics Reference](./metrics-alerts-reference#pod-and-container-resources)`（metric-charts）
- ✅ `詳細は、[Integrate with AWS S3](./integrate-with-aws-s3) および [External Volumes](./external-volume) を参照してください。`（release-notes）
- 对照（译出）：`[Spark バッチジョブの一覧表示](/reference/restful/list-spark-batch-jobs)`（spark-manage）——同一语料内两种策略并存。

**R8.3 参照句式固定：詳細は／詳細については、[X] を参照してください。** `[语料]`
- ✅ `利用可能なメトリクスの概要については、[Metrics Reference](./metrics-alerts-reference#pod-and-container-resources) を参照してください。`
- ⚠ 引号包裹变体并存：`「[Spark バッチジョブ](./spark-batch-jobs)」を参照してください。`（spark-data-backfill）vs 无引号 `リファレンスの [Spark バッチジョブの一覧表示](…) を参照してください。`（spark-manage）→ 见 D9。

**R8.4 链接前后与日文之间加半角空格** `[语料]`
- ✅ `詳細については、[Okta 公式ドキュメント](https://…) を参照してください。`

---

## 9. 标题（Headings）

**R9.1 章节标题译为日文，用动词连体形「〜する」或名词句，句尾无标点** `[语料]`
- ✅ `## 事前チェック付きのデータバックフィルジョブを作成する`（spark-data-backfill）
- ✅ `## ジョブの監視`、`## 外部ボリュームを作成する`（external-volume）

**R9.2 “Before you start” 的既有译法（三种并存）** `[语料]` ⚠（见 D10）
`## 事前準備`（×3，guides/byoc 均有）、`## 開始する前に`（×2）、`## 前提条件`（Prerequisites，×1）。

**R9.3 标题中的 UI 面板名保留英文** `[语料]`
- ✅ `### Pod & container resources`、`### Resources`、`### Performance`（metric-charts 原样保留）

---

## 10. Release Notes 专有句式

**R10.1 “now supports/available” 用「〜ようになりました」** `[语料]`
- ✅ `BYOC が Storage Integration と External Volume をサポートするようになりました。`
- ✅ `API Key を使用して cluster endpoint 経由で cluster にアクセスできるようになりました。`

**R10.2 条目特性名加粗，后接半角冒号或破折号** `[语料]`
- ✅ `- **BYOC のオンデマンド利用**: BYOC 組織は、オンデマンド利用を有効にすることで…`
- ✅ `- **Hugging Face 埋め込みモデル** — Bring Your Own Key 統合を通じて…`

**R10.3 日期徽标保留英文格式** `[语料]`
- ✅ `**2026-07-30**`（Grid 左栏，不译）

**R10.4 “Enhancements” 译为「機能強化」** `[语料]`
- ✅ `## 機能強化`（release-notes，多处一致）

---

## 11. 图片与多媒体

**R11.1 图片 alt 为不透明 token 时逐字保留** `[语料]`
- ✅ `![SWfawcEqhhLaP2bltqkcy9bUn8g](https://zdoc-images.s3.us-west-2.amazonaws.com/….png)`（spark-manage）
- 语义化 alt 的翻译策略本批语料无样本 → 见 D11。

---

# 已裁决（v1.1，2026-09-11）

> 原「待人工裁决」12 条已全部定稿，规则如下，与正文条款同等效力。

**D1 → B**：Admonition `title` 统一本地化：`Notes→注意`、`Warning→警告`、`Tips→ヒント`、`Note→注記`；语义化标题照常翻译。存量 10 处英文标题需回改（内容侧任务，单独跟踪）。

**D2 → A**：术语白名单制：已定译名（cluster/collection/database/volume/storage request 等）一律片假名化；白名单外（新特性名、未定名概念）暂保留英文并登记进术语表。release-notes 类页面不得再把已定译名留英文。后续将白名单机制写入 locale contract。

**D3 → A**：「メトリクス」统一：独立名词与复合名词均用 `メトリクス`（含 `メトリクスチャート`）。

**D4 → A**：片假名复合词一律连写不插空格：`クラスターメトリクス`、`コレクションレベル`、`ナビゲーションパネル`。

**D5 → A**：数字空格维持现状主流并明文化：数字+汉字词/拉丁单位加空格（`200 万`、`768 次元`、`10 分`、`50 件`、`1 ページ`）；和语量词「〜つ」连写（`9つ`、`3つ`）。

**D6 → B**：括号一律全角：日语注释与英文缩写括注均用 `（）`（`（AWS profile または access key）`、`仮想マシン（VM）`）。存量半角括注需回改。

**D7 → A**：链接文字：目标页属参考类（reference/REST）或暂无日文版时保留英文；其余译出。

**D8 → A**："similar to the following" 允许简化为 `以下の通りです`（简洁优先，不做弱化）。

**D9 → A**：参照链接一律不用「」包裹：`[Spark バッチジョブ](./spark-batch-jobs) を参照してください。`

**D10 → B**："Before you start" 与 "Prerequisites" 统一译作 `事前準備`。存量 `開始する前に`/`前提条件` 标题需回改。

**D11 → A**：语义化图片 alt 一律翻译为自然日文（可访问性优先）；不透明 token alt（如 `![SWfawcEqhhLaP2bltqkcy9bUn8g]`）逐字保留。

**D12 → A**：`**`code`**` 保留粗体+反引号双层标记，与英文源一致；不降级为单层。
### 附: 语料选样清单（含替代说明）

任务指定页面中 9 对在该 checkpoint 尚无日文版，均以同目录/最近主题页面替代（验证方式 `git cat-file -e`）：

| # | 类型 | EN 路径 | 替代说明 |
|---|------|---------|----------|
| 1 | Spark 教程 | content/en/guides/tutorials/development/spark-batch-jobs/data-backfill.md | primary-key-dedup 未译，同目录替代 |
| 2 | Spark 教程 | …/spark-batch-jobs/manage-spark-batch-jobs.md | 同目录补充 |
| 3 | Spark 教程 | …/spark-batch-jobs/k-means-clustering.md | 同目录补充 |
| 4 | 权限参考 | content/en/byoc/tutorials/management/access-control/privilege-reference/cluster-privileges.md | platform-privileges 未译，同目录替代 |
| 5 | 计费 | content/en/byoc/tutorials/management/billing-management/understand-byoc-billing.md | license-usage 未译，最近主题替代 |
| 6 | 部署 | content/en/byoc/tutorials/deployment/deploy-byoc-i-aws/deploy-byoc-i-aws.md | remove-aws-byoc-i-project 未译，同目录替代 |
| 7 | 入门 | content/en/byoc/tutorials/get-started/cu-types-explained.md | select-zilliz-cloud-service-plans 未译替代 |
| 8 | 存储集成 | content/en/byoc/tutorials/development/volume/storage-integration/integrate-with-aws-s3.md | integrate-with-gcp/azure 未译，同目录替代 |
| 9 | 存储集成 | content/en/byoc/tutorials/development/volume/external-volume.md | 同目录补充 |
| 10 | SSO | content/en/guides/tutorials/management/identity-management/single-sign-on/single-sign-on-with-okta.md | microsoft-entra 未译，同目录替代 |
| 11 | Release notes | content/en/guides/tutorials/get-started/release-notes/release-notes-2607.md | 2609 未译，最新已译版本替代 |
| 12 | 监控 | content/en/byoc/tutorials/management/metrics-alerts/view-cluster-metric-charts.md | 原选 |

JA 侧路径映射: guides → `i18n/ja-JP/docusaurus-plugin-content-docs/current/**`；byoc → `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/**`。
