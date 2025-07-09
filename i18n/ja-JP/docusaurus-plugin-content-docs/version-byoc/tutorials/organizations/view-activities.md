---
title: "アクティビティを見る | BYOC"
slug: /view-activities
sidebar_label: "アクティビティを見る"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのアクティビティ機能は、特定のZilliz Cloud組織に関連するイベントの包括的なビューを提供します。アクセスイベント | BYOC"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - activities
  - view
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search

---

import Admonition from '@theme/Admonition';


# アクティビティを見る

Zilliz Cloudの**アクティビティ**機能は、特定のZilliz Cloud組織に関連するイベントの包括的なビューを提供します。アクセスイベント

## アクティビティを見る{#view-activities}

組織ページで、左ナビゲーションペインの**アクティビティ**をクリックします。ここでは、アクティビティの概要、各アクティビティが置くされた時間、および特定のアクティビティに関与したオペレーターのIDを閲覧可能された時間、および特定のアクティビティに関与したオペレーターのIDを閲覧可能です。

![view-activities-saas](/img/view-activities-saas.png)

</exclude>

![view-activities-byoc](/img/view-activities-byoc.png)

</include>

## フィルター活動{#filter-activities}

組織のアクティビティをコントロールしやすくナビゲートするために、タイプと時間範囲でフィルターを適用することができます。これらのフィルター条件を組み合わせることで、アクティビティリストのよりカスタマイズされたビューが提供されます。

- **時間範囲でフィルター**

    特定の期間内に発生したアクティビティを表示するために、開始時間と終了時間を選択してください。希望の時間範囲を設定した後、**適用**をクリックして、この期間内のすべてのアクティビティを表示してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>選択した開始時間と終了時間が30日を超えないようにしてください。</p>

    </Admonition>

    ![filter-by-time-range](/img/filter-by-time-range.png)

- **アクティビティタイプでフィルター**

    アクティビティリストからお好みのアクティビティタイプを選択してください。Zilliz Cloudでは、アクティビティを「情報」「警告」「エラー」の3つのタイプに分類しています。

    <table>
       <tr>
         <th><p><strong>アクティビティタイプ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
       </tr>
       <tr>
         <td><p>情報を</p></td>
         <td><p>クラスタ、アクセス、または請求に関する一般的な情報。 </p><p>例:クラスタin01-xxxxxxxxxxxxxxxが作成されました。</p></td>
       </tr>
       <tr>
         <td><p>警告</p></td>
         <td><p>注意が必要なリソース状態に関する更新。</p><p>例:「クラスタin01-xxxxxxxxxxxxxxxが削除されました」。</p></td>
       </tr>
       <tr>
         <td><p>エラー</p></td>
         <td><p>支払いの失敗またはその他のシステムの誤動作の通知には、直ちに対応または対応が必要です。 </p><p>例:「請求書invo-xxxxxxxxxxxxxxxxxxxxxxxxの支払いに失敗しました。」</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

- **アクティビティでフィルター**

    ![filter-by-activity](/img/filter-by-activity.png)

