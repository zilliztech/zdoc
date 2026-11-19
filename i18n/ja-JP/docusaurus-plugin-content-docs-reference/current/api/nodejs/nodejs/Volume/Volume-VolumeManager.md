---
title: "VolumeManager | Node.js"
slug: /node/node/Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "このクラスは、クラウドコントロールプレーンを介して Zilliz Cloud プロジェクトのボリュームを管理します。 | Node.js"
type: origin
token: shared-Volume-VolumeManager
sidebar_position: 1
keywords: 
  - ボリューム
  - マネージドボリューム
  - 外部ボリューム
  - ストレージ統合
  - zilliz
  - zilliz cloud
  - クラウド
  - VolumeManager
  - nodejs30
displayed_sidebar: nodeSidebar

---

# VolumeManager

**VolumeManager** は、Zilliz Cloud コントロールプレーンを介して Zilliz Cloud プロジェクトのボリュームを管理します。ボリュームは外部コレクションを支えます。**EXTERNAL** ボリュームは読み取り専用で、外部コレクションを作成または更新するときに `volume://` ソースとして参照できます。一方、**MANAGED** ボリュームは、データを書き込めるマネージドストレージです。

このマネージャーは、API キーを使用して Zilliz Cloud REST コントロールプレーンと通信します。クラウド専用であり、オープンソースの Milvus サーバーにはボリュームという概念はありません。

```javascript
const { VolumeManager } = require('@zilliz/milvus2-sdk-node');

const volumeManager = new VolumeManager({
  cloudEndpoint: 'https://api.zilliz.com',
  apiKey: '_YOUR_API_KEY_',
});
```

## Constructor\{#constructor}

```javascript
new VolumeManager(config: VolumeManagerConfig)
```

**VolumeManagerConfig** オブジェクトから **VolumeManager** インスタンスを構築します。

**パラメーター:**

- **config** (*VolumeManagerConfig*) -

    **[必須]**

    マネージャーの設定です。

    - **cloudEndpoint** (*string*) -

        **[必須]**

        Zilliz Cloud コントロールプレーンのエンドポイントです。

    - **apiKey** (*string*) -

        **[必須]**

        Zilliz Cloud API キーです。リクエストでは、これを Bearer トークンとして送信します。

    - **fetch** (*typeof fetch*) -

        カスタムの `fetch` 実装です。デフォルトではグローバルの `fetch` が使用されます。

    - **timeout** (*number*) -

        ミリ秒単位のリクエストタイムアウトです。デフォルトでは SDK のデフォルト HTTP タイムアウトが使用されます。

## Methods\{#methods}

**メソッド:**

- **createVolume** (*Promise&lt;VolumeResponse&gt;*) -

    プロジェクトおよびリージョンにボリュームを作成します。

    - **data** (*VolumeCreateReq*) -

        **[必須]**

        - **projectId** (*string*) -

            **[必須]**

            Zilliz Cloud プロジェクトの ID です。

        - **regionId** (*string*) -

            **[必須]**

            ボリュームが属するリージョンの ID です。

        - **volumeName** (*string*) -

            **[必須]**

            作成するボリュームの名前です。

        - **type** (*string*) -

            ボリュームタイプです。**MANAGED**（デフォルト）または **EXTERNAL** を指定します。**EXTERNAL** ボリュームには **storageIntegrationId** と **path** が必要で、読み取り専用です。

        - **storageIntegrationId** (*string*) -

            **EXTERNAL** ボリュームの基盤となるストレージ統合です。**type** が **EXTERNAL** の場合に必要です。

        - **path** (*string*) -

            **EXTERNAL** ボリュームのストレージパスです。**type** が **EXTERNAL** の場合に必要です。

- **listVolumes** (*Promise&lt;VolumeResponse&gt;*) -

    プロジェクトのボリュームを一覧表示します。

    - **data** (*VolumeListReq*) -

        **[必須]**

        - **projectId** (*string*) -

            **[必須]**

            Zilliz Cloud プロジェクトの ID です。

        - **currentPage** (*number*) -

            返すページ番号です。デフォルトは 1 です。

        - **pageSize** (*number*) -

            1 ページあたりのボリューム数です（1-100）。デフォルトは 10 です。

        - **type** (*string*) -

            ボリュームタイプ（**MANAGED** または **EXTERNAL**）で結果を絞り込みます。

- **describeVolume** (*Promise&lt;VolumeResponse&gt;*) -

    名前で 1 つのボリュームの詳細を取得します。

    - **data** (*VolumeNameReq*) -

        **[必須]**

        - **volumeName** (*string*) -

            **[必須]**

            詳細を取得するボリュームの名前です。

- **applyVolume** (*Promise&lt;VolumeResponse&gt;*) -

    ボリュームをパスに適用します。**MANAGED** ボリュームの場合は、指定されたパスにボリュームデータをステージングします。**EXTERNAL** ボリュームは読み取り専用であり、適用できません。

    - **data** (*VolumeApplyReq*) -

        **[必須]**

        - **volumeName** (*string*) -

            **[必須]**

            適用するボリュームの名前です。

        - **path** (*string*) -

            **[必須]**

            ボリュームを適用するパスです。

- **deleteVolume** (*Promise&lt;VolumeResponse&gt;*) -

    名前で 1 つのボリュームを削除します。

    - **data** (*VolumeNameReq*) -

        **[必須]**

        - **volumeName** (*string*) -

            **[必須]**

            削除するボリュームの名前です。

**戻り値:**

*Promise&lt;VolumeResponse&gt;*

各メソッドは、コントロールプレーンの応答（`code`、`data`、`message`）を含む **VolumeResponse** に解決されます。

すべてのメソッドは、最後の省略可能な引数として、**timeout**（ミリ秒）とキャンセル用の **abortController** を持つ **VolumeRequestOptions** を受け取ります。

**例外:**

- **Error**

    コントロールプレーンがリクエストを拒否した場合に発生します。正確な失敗理由については、応答の `code` と `message` を確認してください。

## Example\{#example}

```javascript
const created = await volumeManager.createVolume({
  projectId: 'proj-xxxxxxxx',
  regionId: 'aws-us-west-2',
  volumeName: 'my-external-volume',
  type: 'EXTERNAL',
  storageIntegrationId: 'int-xxxxxxxx',
  path: 's3://my-bucket/volumes/main',
});

const volumes = await volumeManager.listVolumes({ projectId: 'proj-xxxxxxxx' });
```
