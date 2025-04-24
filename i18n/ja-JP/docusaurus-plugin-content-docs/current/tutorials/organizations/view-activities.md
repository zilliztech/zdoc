---
title: "アクティビティを見る | Cloud"
slug: /view-activities
sidebar_label: "アクティビティを見る"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのアクティビティ機能は、の課金イベントやのアクセスイベントなど、特定のZilliz Cloud組織に関連するイベントを包括的に表示します。 | Cloud"
type: origin
token: MqTVwHcERia7pIkfkg3c2syFnne
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - activities
  - view
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';


# アクティビティを見る

Zilliz Cloudの**アクティビティ**機能は、の課金イベントやのアクセスイベントなど、特定のZilliz Cloud組織に関連するイベントを包括的に表示します。

## アクティビティを見る{#view-activities}

組織ページで、左ナビゲーションウィンドウの[**アクティビティ**]をクリックします。ここでは、アクティビティの概要、各アクティビティが置かれた時間、および特定のアクティビティに関与したオペレーターのIDを閲覧できます。

![view-activities-saas](/img/view-activities-saas.png)

## フィルター活動{#filter-activities}

組織のアクティビティをコントロールしやすくナビゲートするために、タイプと時間範囲でフィルターを適用することができます。これらのフィルター条件を組み合わせることで、アクティビティリストのよりカスタマイズされたビューが提供されます。

- **時間範囲でフィルター**

    特定の期間内に発生したアクティビティを表示するには、開始時間と終了時間を選択します。希望の時間範囲を設定したら、[**適用**]をクリックして、この期間内のすべてのアクティビティを表示します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>選択した開始時間から終了時間までの期間が30日を超えないようにしてください。</p>

    </Admonition>

    ![filter-by-time-range](/img/filter-by-time-range.png)

- **アクティビティタイプで絞り込む**

    アクティビティリストからお好みのアクティビティタイプを選択してください。Zilliz Cloudは、アクティビティを**情報**、**警告**、**エラー**の3つのタイプに分類します。

    <table>
       <tr>
         <th><p><strong>アクティビティタイプ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>情報を</p></td>
         <td><p>クラスタ、アクセス、または請求に関する一般的な情報。 例:クラスタin01-xxxxxxxxxxxxxxxが作成されました。</p></td>
       </tr>
       <tr>
         <td><p>警告</p></td>
         <td><p>注意が必要なリソース状態に関する更新。 例:「クラスタin01-xxxxxxxxxxxxxxxが削除されました」。</p></td>
       </tr>
       <tr>
         <td><p>エラー</p></td>
         <td><p>支払いの失敗またはその他のシステムの誤動作の通知には、直ちに対応または対応が必要です。 例:「請求書invo-xxxxxxxxxxxxxxxxxxxxxxxxの支払いに失敗しました。」</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

- **アクティビティでフィルター**

    ![filter-by-activity](/img/filter-by-activity.png)

