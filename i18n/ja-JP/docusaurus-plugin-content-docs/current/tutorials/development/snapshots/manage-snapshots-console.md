---
title: "スナップショットの管理（コンソール） | Cloud"
slug: /manage-snapshots-console
sidebar_label: "スナップショットの管理（コンソール）"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "SDK を使用してプログラムでスナップショットを管理する代わりに、Zilliz Cloud コンソールでも管理できます。このガイドでは、スナップショットの作成、新しいコレクションへの復元、削除、および Zilliz Cloud がスケジュールに従ってスナップショットを作成するためのスナップショットポリシーの設定方法について説明します。 | Cloud"
type: origin
token: PSK1wxf6Qi2EENkCjc2cyNBSn0g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# スナップショットの管理（コンソール）

SDK を使用してプログラムでスナップショットを管理する代わりに、Zilliz Cloud コンソールでもスナップショットを管理できます。このガイドでは、スナップショットの作成、新しいコレクションへの復元、削除、および Zilliz Cloud がスケジュールに従ってスナップショットを作成するためのスナップショットポリシーの設定方法について説明します。

<Admonition type="info" title="Note">

この機能は Dedicated クラスターでのみ使用できます。

</Admonition>

## スナップショットを作成する\{#create-a-snapshot}

このデモでは、**Dedicated-02** という名前の Dedicated クラスターにある **medium_articles** という名前のコレクションのスナップショットを作成します。

<Supademo id="cmwlhd6h70406qmp5nxi8f8p5" title=""  />

<Procedures>

1. 左側のナビゲーションツリーで **Serving クラスター** をクリックし、対象のクラスターを探します。

1. クラスターツリーで対象コレクションの名前をクリックします。

1. **Snapshots** タブをクリックします。

1. このコレクションのスナップショットを作成するには、**+ Snapshot** をクリックします。

1. 表示された **Create snapshot** ダイアログで、作成するスナップショットの名前と任意の説明を設定します。

1. **Create** をクリックします。

</Procedures>

## スナップショットを復元する\{#restore-a-snapshot}

一覧に表示されたスナップショットは、新しいコレクションに復元できます。

<Supademo id="cmwlhrk0n0001qmbeoz4dmv8n" title=""  />

<Procedures>

1. **Snapshots** タブで対象のスナップショットを探します。

1. **Actions** の **...** をクリックし、ドロップダウンリストから **Restore** をクリックします。

1. 表示された **Restore snapshot** ダイアログで、

    1. 対象のデータベースを設定します。

    1. 新しいコレクション名を設定します。

1. **Restore** をクリックします。

1. ステータスが **Successful** に変わるまで、復元の進行状況を監視します。

</Procedures>

## スナップショットを削除する\{#drop-a-snapshot}

不要になったスナップショットは削除できます。

<Supademo id="cmwli4yvy001bqmbe279hp4w6" title=""  />

<Procedures>

1. **Snapshots** タブで対象のスナップショットを探します。

1. **Actions** の **...** をクリックし、ドロップダウンリストから **Delete** をクリックします。

1. 表示された **Delete snapshot** ダイアログで、

    1. 対象のスナップショットの名前をコピーします。

    1. 下のテキストボックスに貼り付けます。

1. **Delete** をクリックします。

</Procedures>

## スケジュールポリシーを設定する\{#configure-schedule-policies}

別の方法として、Zilliz Cloud がコレクションのスナップショットを作成するスケジュールポリシーを設定することもできます。

<Supademo id="cmwlihgrl004gqmbehn5lg209" title=""  />

<Procedures>

1. 対象のコレクションで **Snapshots** タブをクリックします。

1. **Snapshot policy** をオンにします。

1. 表示された **Snapshot Policy Settings** ダイアログで、

    1. 現在のポリシーのタイムゾーンを設定します。

    1. **Basic** モードと **Advanced** モードのいずれかを選択します。

        - **Basic** モードでは、Zilliz Cloud が定期的にスナップショットを作成する頻度、曜日、時刻を設定できます。

        - または、**Advanced** モードで `0 9 * * 1-5` などの cron 式を使用して、間隔を指定できます。詳細は、[Cron 式について](./cron-expression) を参照してください。

    1. 保持期間を日単位で設定します。

        デフォルト値は 7 日です。最大 30 日まで延長できます。

1. **Save** をクリックします。

</Procedures>
