---
title: "使用ごみ箱 | BYOC"
slug: /use-recycle-bin
sidebar_label: "使用ごみ箱"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのごみ箱機能は、意図的にまたはトライアルの期限切れやサービスの停止の結果として削除されたすべてのサーバーレスおよび専用クラスターの記録を保持することにより、データを保護します。気が変わった場合や誤ってクラスターを削除した場合、ごみ箱はクラスターの復元のための30日間の猶予期間を提供します。 | BYOC"
type: origin
token: OLUIwGNEji5N13kKr5zcI1djncb
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - recycle bin
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';


# 使用ごみ箱

Zilliz Cloudのごみ箱機能は、意図的にまたはトライアルの期限切れやサービスの停止の結果として削除されたすべてのサーバーレスおよび専用クラスターの記録を保持することにより、データを保護します。気が変わった場合や誤ってクラスターを削除した場合、ごみ箱はクラスターの復元のための30日間の猶予期間を提供します。

ごみ箱を使用するには、**組織オーナー**である必要があります。

## ごみ箱に落ちたクラスタを復元する{#restore-a-dropped-cluster-in-the-recycle-bin}

1. 削除されたクラスタが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから**ごみ箱**にアクセスします。

1. [**アクション**]ドロップダウンから[**クラスタの復元**]を選択します。

1. 復元されたクラスタを構成します。

    1. この組織の別のプロジェクトにクラスターを復元できますが、別のクラウドリージョンには復元できません。

    1. クラスターの名前を変更し、接続の体格とパスワードをリセットできます。

    <Admonition type="info" icon="📘" title="ノート">

    <p>クラスタ内のコレクションの負荷状態は保持されます。</p>

    </Admonition>

1. [**リストア**]をクリックします。Zilliz Cloudは、指定された属性を持つクラスタの作成を開始し、作成したクラスタにデータをリストアします。

1. 新しいリストアジョブが生成されます。[ジョブ](./job-center)ページでクラスタのリストアの進捗状況を確認できます。ジョブのステータスが**IN PROGRESS**から**SUCCESS FUL**に切り替わると、リストアが完了します。

![byoc-use-recycle-bin](/img/byoc-use-recycle-bin.png)

