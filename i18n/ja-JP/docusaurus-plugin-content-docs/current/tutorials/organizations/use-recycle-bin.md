---
title: "ごみ箱の使用 | Cloud"
slug: /use-recycle-bin
sidebar_label: "ごみ箱の使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのごみ箱機能は、意図的または試用期限切れやサービス停止の結果として削除されたすべてのサーバーレスおよび専用クラスターを記録しておくことで、データを保護します。クラスターを削除したくなくなった場合や、誤ってクラスターを削除してしまった場合は、ごみ箱が30日間の猶予期間を提供し、クラスターを復元できます。 | Cloud"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - recycle bin
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';


# ごみ箱の使用

Zilliz Cloudのごみ箱機能は、意図的または試用期限切れやサービス停止の結果として削除されたすべてのサーバーレスおよび専用クラスターを記録しておくことで、データを保護します。クラスターを削除したくなくなった場合や、誤ってクラスターを削除してしまった場合は、ごみ箱が30日間の猶予期間を提供し、クラスターを復元できます。

ごみ箱を使用するには、**Organization Owner（組織オーナー）**である必要があります。

## 前提条件\{#prerequisites}

ごみ箱内のクラスターを復元するには、[支払い方法を追加](/docs/payment-billing)する必要があります。

## ごみ箱内の削除されたクラスターを復元\{#restore-a-dropped-cluster-in-the-recycle-bin}

1. 削除されたクラスターが属する組織に移動します。

2. 左側のナビゲーションメニューまたは右上ナビゲーションアイコンから**ごみ箱**にアクセスします。

3. 復元するクラスターを見つけます。**アクション**ドロップダウンから**「クラスターを復元」**を選択します。

4. 復元されたクラスターを設定します。

    1. この組織内の別のプロジェクトにクラスターを復元できますが、別のクラウドリージョンには復元できません。

    2. クラスター名を変更し、クエリCUの数をリセットできます。

    <Admonition type="info" icon="📘" title="Notes">

    <p>クラスター内のコレクションの読み込み状態は保持されます。</p>

    </Admonition>

5. **「復元」**をクリックします。Zilliz Cloudは、指定された属性でクラスターを作成し始め、作成されたクラスターにデータを復元します。

6. 新しい復元ジョブが生成されます。[ジョブ](./job-center)ページでクラスター復元の進行状況を確認できます。ジョブのステータスが**進行中**から**成功**に切り替わると、復元が完了します。

![use-recycle-bin](/img/use-recycle-bin.png "use-recycle-bin")