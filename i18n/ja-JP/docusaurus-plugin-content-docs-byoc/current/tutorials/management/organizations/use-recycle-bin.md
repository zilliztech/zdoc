---
title: "Recycle Bin の使用 | BYOC"
slug: /use-recycle-bin
sidebar_label: "Recycle Bin の使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Recycle Bin 機能は、意図的な削除だけでなく、トライアル期間の終了やサービス停止に伴う削除も含め、削除されたすべてのクラスターの記録を保持し、データを保護します。削除を取り消したい場合や誤ってクラスターを削除してしまった場合でも、Recycle Bin を利用することで 30 日間の猶予期間内にクラスターを復元できます。 | BYOC"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Recycle Bin の使用

Zilliz Cloud の Recycle Bin 機能は、意図的な削除だけでなく、トライアル期間の終了やサービス停止に伴う削除も含め、削除されたすべてのクラスターの記録を保持し、データを保護します。削除を取り消したい場合や誤ってクラスターを削除してしまった場合でも、Recycle Bin を利用することで 30 日間の猶予期間内にクラスターを復元できます。

Recycle Bin を使用するには、**Organization Owner** 権限が必要です。

## Recycle Bin から削除済みクラスターを復元する\{#restore-a-dropped-cluster-in-the-recycle-bin}

![byoc-use-recycle-bin](https://zdoc-images.s3.us-west-2.amazonaws.com/byoc-use-recycle-bin.png "byoc-use-recycle-bin")

<Procedures>

1. 削除したクラスターが属する組織に移動します。

1. 左側のナビゲーションメニューまたは上部のナビゲーションアイコンから **Recycle Bin** にアクセスします。

1. 復元対象のクラスターを探し、**Actions** ドロップダウンから **Restore Full クラスター** を選択します。

1. 復元するクラスターの設定を行います。

    1. この組織内の別のプロジェクトにクラスターを復元できますが、別のクラウドリージョンには復元できません。

    1. クラスター名の変更およびクエリ CU 数の再設定が可能です。

    1. 削除されたクラスターの保持方法によっては、復元ページで別のターゲット Milvus バージョンを選択できる場合があります。バージョンセレクターが利用可能な場合は、復元するクラスターの Milvus バージョンを選択します。バージョンセレクターが利用できない場合、復元されるクラスターは元のクラスターバージョンを使用し、ターゲットバージョンは変更できません。

    <Admonition type="info" icon="📘" title="Notes">

    クラスター内のコレクションのロード状態も維持されます。

    </Admonition>

1. **Restore** をクリックすると、Zilliz Cloud が指定された属性に基づいてクラスターの作成を開始し、データを作成されたクラスターに復元します。

1. 新しい復元ジョブが生成されます。クラスターの復元状況は [Jobs](./job-center) ページで確認できます。ジョブのステータスが **IN PROGRESS** から **SUCCESSFUL** に変われば、復元完了です。

</Procedures>
