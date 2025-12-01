---
title: "ごみ箱を使用 | Cloud"
slug: /use-recycle-bin
sidebar_label: "ごみ箱を使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのごみ箱機能は、意図的または試験の期限切れまたはサービス中断の結果として削除されたすべてのサーバーレスおよび専用クラスターの記録を保持して、データの安全性を確保します。クラスターの削除を変更した場合や誤ってクラスターを削除した場合、ごみ箱はクラスターを復元するための30日間の猶予期間を提供します。 | Cloud"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 3
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - ごみ箱
  - ベクター類似検索
  - 近似的最近傍検索
  - DiskANN
  - スパースベクター

---

import Admonition from '@theme/Admonition';


# ごみ箱を使用

Zilliz Cloudのごみ箱機能は、意図的または試験の期限切れまたはサービス中断の結果として削除されたすべてのサーバーレスおよび専用クラスターの記録を保持して、データの安全性を確保します。クラスターの削除を変更した場合や誤ってクラスターを削除した場合、ごみ箱はクラスターを復元するための30日間の猶予期間を提供します。

ごみ箱を使用するには、**組織オーナー**である必要があります。

## 前提条件\{#prerequisites}

ごみ箱内のクラスターを復元するには、[支払い方法を追加](/docs/payment-billing)する必要があります。

## ごみ箱内の削除されたクラスターを復元\{#restore-a-dropped-cluster-in-the-recycle-bin}

1. 削除されたクラスターが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコン経由で**ごみ箱**にアクセスします。

1. 復元するクラスターを見つけます。**操作**ドロップダウンから**クラスターを復元**を選択します。

1. 復元されたクラスターを構成します。

    1. 異なるプロジェクトにクラスターを復元できますが、異なるクラウドリージョンには復元できません。

    1. クラスター名を変更し、クエリCU数をリセットできます。

    <Admonition type="info" icon="📘" title="注意">

    <p>クラスター内のコレクションのロード状態は保持されます。</p>

    </Admonition>

1. **復元**をクリックします。Zilliz Cloudは、指定された属性を持つクラスターの作成を開始し、作成されたクラスターにデータを復元します。

1. 新しい復元ジョブが生成されます。[ジョブ](./job-center)ページでクラスター復元の進行状況を確認できます。ジョブの状態が**進行中**から**成功**に切り替わると、復元が完了します。

![use-recycle-bin](/img/use-recycle-bin.png)
