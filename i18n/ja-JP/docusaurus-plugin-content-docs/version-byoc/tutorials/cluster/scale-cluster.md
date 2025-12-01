---
title: "クラスターのスケーリング | BYOC"
slug: /scale-cluster
sidebar_label: "クラスターのスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ワークロードが増加し、より多くのデータが書き込まれるにつれて、クラスターは容量制限に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。 | BYOC"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 管理
  - オープンソースベクトルDB
  - ベクトルデータベースの例
  - RAGベクトルデータベース
  - ベクトルDBとは

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クラスターのスケーリング

ワークロードが増加し、より多くのデータが書き込まれるにつれて、クラスターは容量制限に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。

これを積極的に管理するために、[メトリクス](./metrics-alerts-reference)ページで**CU容量**を監視し、スケーリングが必要なタイミングを判断できます。ビジネスニーズとパターンに基づき、クエリCU数を増やしてクラスター容量を拡張するか、需要が減少したときにコスト削減のために削減できます。

1〜8CUのクラスターの場合、クエリCUを直接スケーリングできることにご注意ください。8CUを超えるクラスターの場合は、[レプリカ](./manage-replica)を増加させてください。

このガイドでは、変化するワークロードに対応してクラスターのサイズ変更方法を説明します。

## 考慮事項\{#considerations}

- **リソース制限**:

    - **スケールアップ**

        - Dedicated (Standard)クラスター: 最大32CU

            Dedicated (Enterprise)クラスター: 最大256CU

        - **クエリCU数** × **レプリカ数**の積は256を超えてはいけません

        より大きなクエリCUについては、[営業担当に連絡](http://zilliz.com/contact-sales)してください。

    - **スケールダウン**

        - レプリカを持つクラスターは8CU未満にスケールダウンできません

        - スケールダウン要求は以下の条件の両方が満たされた場合にのみ成功します：

            - 現在のデータ量 < 新しいCUサイズのCU容量の80%

            - 現在のコレクション数およびパーティション数 < 新しいCUサイズで許可される[最大コレクション数およびパーティション数](./limits#collections)

- **スケーリング中**: クラスターのステータスは「修正中」に変更され、その間は操作を実行できません。複数のスケーリングタスクがトリガーされた場合、それらはトリガータイムスタンプに基づいて順次処理されます。完了時間はデータ量によって異なります。

- **パフォーマンスへの影響**: スケーリングによりわずかなサービスのジャッターが発生する可能性があります。

- **バックアップ制限**: 動的およびスケジュールされたスケーリング設定は[バックアップ](./create-snapshot)には含まれません。クラスターを復元した後は、これらの設定を手動で再構成してください。

## 手動スケーリング\{#manual-scaling}

Zilliz CloudコンソールまたはRESTful API経由でクラスターを手動でスケールアップまたはスケールダウンできます。スケジュールされたスケーリングはウェブコンソールでのみ利用可能であることに注意してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでクラスターを手動でスケールアップおよびスケールダウンする方法を示しています。

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p><strong>クエリノードCUのスケール</strong>ダイアログボックスで<strong>保存</strong>をクリックすると、プロジェクトのリソースクォータを確認するように求められます。リソースが十分であれば、チェックが完了した後にダイアログボックスは消えます。そうでない場合は、以下が可能です。</p>
<ul>
<li><p><strong>プロジェクトリソース設定に移動</strong>をクリックしてプロジェクトのリソース設定を編集するか、または</p></li>
<li><p><strong>最後のステップに戻る</strong>をクリックしてクラスタ設定を変更します。</p></li>
</ul>
<p>プロセス中、ローリングには追加リソースが必要になります。これらのリソースは使用後に解放されます。</p>

</Admonition>

### RESTful API経由\{#via-restful-api}

以下の例では、既存クラスターを2CUにスケーリングします。詳細については、[Modify Cluster](/reference/restful/modify-cluster-v2)を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

以下は出力例です。

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "正常に送信されました。クラスターのアップグレードが進行中で、数分かかる見込みです。DescribeCluster APIを使用して、クラスターの作成進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、SDKを使用してベクトルデータベースにアクセスできます。"
    }
}
```