---
title: "Stage経由でMilvusからZilliz Cloudへの移行 | Cloud"
slug: /via-stage
sidebar_label: "Via Stage"
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloudは、Milvusからのデータ移行時にバックアップデータのストレージスポットとして機能する内部ステージ機能を提供します。この機能により、ユーザーは複雑な詳細を手動で処理することなく、より簡単かつ効率的にデータ移行を行うことができ、ユーザビリティと成功率が大幅に向上します。 | Cloud"
type: origin
token: IxO5wZ1meiYrTckUPkQca9JOnbS
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - backup files
  - stage
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


# Stage経由でMilvusからZilliz Cloudへの移行

Zilliz Cloudは、Milvusからのデータ移行時にバックアップデータのストレージスポットとして機能する内部ステージ機能を提供します。この機能により、ユーザーは複雑な詳細を手動で処理することなく、より簡単かつ効率的にデータ移行を行うことができ、ユーザビリティと成功率が大幅に向上します。

この機能により、次のようなさまざまな移行シナリオでの操作の複雑さが解消されます。

- ローカルバックアップファイルで移行する場合のファイル体格の制限。

- バケットベースの移行を使用する際に、異なるクラウドプロバイダからのクラウドストレージバケット構成を理解する。

- エンドポイントベースの移行を実行する際に、Milvusインスタンスエンドポイントのネットワークアクセシビリティを確保する。

<Admonition type="info" icon="📘" title="ノート">

<p>ステージを介した移行は<strong>プライベートプレビュー</strong>中です。興味がある場合、問題が発生した場合、または関連するコストについて学びたい場合は、<a href="https://support.zilliz.com/hc/en-us/requests/new">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 始める前に{#before-you-start}

- **組織オーナー**または**プロジェクト管理者**の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

- ターゲットクラスタのCU体格がソースデータを収容できることを確認してください。必要なCU体格を推定するには、[電卓](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator)を使用してください。

## 手続き{#procedure}

この手順では、Milvus Backupを使用してバックアップファイルを準備し、Zilliz Cloudの内部ステージにアップロードし、指定されたターゲットのZilliz Cloudクラスタに移行します。

1. **[milvusのバックアップ](https://github.com/zilliztech/milvus-backup/releases)**をダウンロードしてください。常に最新リリースを使用してください。

    現在、Milvus 2.2以降のバージョンのデータをZilliz Cloudクラスターに移行することができます。互換性のあるソースとターゲットのMilvusバージョンの詳細については、[Milvusバックアップの概要](https://milvus.io/docs/milvus_backup_overview.md)を参照してください。

1. ダウンロードしたバイナリと並べて**configs**フォルダを作成し、**[バックアップ. yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)**を**configs**フォルダにダウンロードしてください。

    ステップが完了すると、ワークスペースフォルダの構造は次のようになります:

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. **backup. yaml**をカスタマイズしてください。

    1. 以下の設定項目を設定します。

        - インラインコードプレースホルダー0

            Zilliz Cloudコントロールプレーンのエンドポイントは`https://api.cloud.zilliz.com`です。

        - インラインコードプレースホルダー0

            マイグレーションのターゲットクラスタを操作するための十分な権限を持つ有効なZilliz Cloud APIキー。詳細については、[APIキー](./manage-api-keys)を参照してください。

    1. 以下の設定項目が正しいかどうかを確認してください。

        - インラインコードプレースホルダー0

        - インラインコードプレースホルダー0

        - インラインコードプレースホルダー0

        - インラインコードプレースホルダー0

        - インラインコードプレースホルダー0

        - インラインコードプレースホルダー0

        - インラインコードプレースホルダー0

    <Admonition type="info" icon="📘" title="ノート">

    <ul>
    <li><p>Docker Composeを使用してインストールされたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>a-bucket</code>であり、<code>rootPath</code>のデフォルトは<code>files</code>です。</p></li>
    <li><p>KubernetesにインストールされたMilvusインスタンスの場合、<code>minio.bucketName</code>のデフォルトは<code>milvus-bucket</code>であり、<code>rootPath</code>のデフォルトは<code>file</code>です。</p></li>
    </ul>

    </Admonition>

1. Milvusインストールのバックアップを作成します。

    ```bash
    ./milvus-backup --config backup.yaml create -n my_backup
    
    # my_backup is the name of the backup file 
    # and will be used in the migrate command
    ```

1. ターゲットのZilliz Cloudクラスタを作成し、クラスタIDをメモし、次のコマンドを実行してマイグレーションを開始します。

    ```bash
    ./milvus-backup migrate --cluster_id inxx-xxxxxxxxxxxxxxx -n my_backup
    
    # cluster_id is the ID of the target Zilliz Cloud cluster
    # my_backup is the name of the backup file created in the above command
    
    # The command output is similar to the following:
    # Successfully triggered migration with backup name: my_backup target cluster: inxx-xxxxxxxxxxxxxxx migration job id: job-xxxxxxxxxxxxxxxxxxx.
    # You can check the progress of the migration job in Zilliz Cloud console.
    ```

    Milvus Backupは、このコマンドを実行すると、準備したバックアップファイルをZilliz Cloudの内部ステージにアップロードし、移行ジョブを作成し、ジョブIDをコマンド出力として返します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>内部ステージにアップロードされたバックアップファイルは、アップロード後3日間ステージに残り、その後削除されます。</p>

    </Admonition>

## 移行過程を監視する{#monitor-the-migration-process}

「移行」をクリックすると、移行ジョブが生成されます。[仕事](./job-center)ページで移行の進捗状況を確認できます。ジョブの状態が「進行中」から「成功」に切り替わると、移行は完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## ポストマイグレーション{#post-migration}

移行ジョブが完了したら、次の点に注意してください。

- **インデックスの作成**:移行過程で、移行されたコレクションの[AUTOINDEX](./autoindex-explained)が自動的に作成されます。

- 手動ロードが必要です:自動インデックス化されているにもかかわらず、移行されたコレクションはすぐに検索またはクエリ操作に利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、[ロード&リリース](./load-release-collections)を参照してください。

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[仕事](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. エラーログにアクセスするには、**アクション**列の**詳細を表示**をクリックしてください。

