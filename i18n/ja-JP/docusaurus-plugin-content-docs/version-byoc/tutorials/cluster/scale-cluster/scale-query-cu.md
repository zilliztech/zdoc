---
title: "クエリCUのスケーリング | BYOC"
slug: /scale-query-cu
sidebar_key: scale-query-cu
sidebar_label: "クエリCUのスケーリング"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "ワークロードの増加やデータの書き込み量が多くなると、サービングクラスターが容量上限に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作が失敗する可能性があります。 | BYOC"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター
  - スケール
  - 管理
  - query cu

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クエリCUのスケーリング

ワークロードの増加とデータの書き込みが進むにつれ、サービングクラスターは容量の限界に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。

これを事前に管理するため、[メトリクス](./metrics-alerts-reference) ページで **クエリ** **CU容量** を監視し、クエリCUのスケーリングが必要なタイミングを判断できます。ビジネスニーズとパターンに基づいて、クエリCUの数を増やしてクラスター容量を拡張したり、需要が減少した際にコスト削減のため減らしたりすることができます。

1～8 CU のサービングクラスターでは、クエリ CU を直接スケーリングできます。8 CU を超えるサービングクラスターについては、[レプリカ](./manage-replica)を増やしてください。

このガイドでは、変化するワークロードに合わせてサービングクラスターのサイズを変更する方法について説明します。

## 考慮事項\{#considerations}

- **リソースの制限**: 

    - **スケールアップ**

        - Dedicated (Standard) クラスター: 最大32 CU

            Dedicated (Enterprise) クラスター: 最大2,048 CU

        - **クエリ CU 数** × **レプリカ数** の積は204,800を超えてはいけません

        より大きなクエリCUについては、[営業にお問い合わせ](http://zilliz.com/contact-sales) ください。

    - **スケールダウン**

        - レプリカを持つクラスターは8 CU未満にスケールダウンできません

        - スケールダウンのリクエストは、以下の条件を満たす場合のみ成功します:

            - 現在のデータ量 < 新しいCUサイズのCU容量の80%

            - 現在のコレクション数とパーティション数 < 新しいCUサイズで許可される[コレクションとパーティションの最大数](./limits#collections)

- **スケーリング中**: クラスターのステータスが「変更中」に変わり、この間は操作を実行できません。複数のスケーリングタスクがトリガーされた場合、トリガー時刻に基づいて順次処理されます。完了時間はデータ量に依存します。

- **スケーリング中の課金:** クエリ CU のスケーリングジョブ中、Zilliz Cloud は以前のクエリ CU 構成に基づいてクラスタに課金し続けます。新しいクエリ CU 数は、スケーリングジョブが正常に完了した後にのみ課金に使用されます。スケーリングジョブが進行中の場合や完了しなかった場合、課金は以前のクエリ CU 構成に基づいたままです。

- **パフォーマンスへの影響**: スケーリングにより、わずかなサービスの揺らぎが発生する可能性があります。

- **バックアップの制限**: 動的およびスケジュールされたスケーリング設定は、[バックアップ](./create-backup) に含まれません。クラスターを復元した後、これらの設定を手動で再構成してください。

## 手動スケーリング\{#manual-scaling}

Zilliz Cloud コンソールまたは RESTful API を使用して、クラスターを手動でスケールアップまたはスケールダウンできます。

以下のデモでは、Zilliz Cloud Web コンソールでクラスターを手動でスケールアップおよびスケールダウンする方法を示しています。

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Admonition type="info" icon="📘" title="Notes">

**Scale Query Node CU** ダイアログボックスで **Save** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば確認完了後にダイアログボックスが消えます。十分でない場合は、次のいずれかを実行できます。

- **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する。

- **Back to Last Step** をクリックして、クラスター設定を変更する。

このプロセス中、ローリングのために追加のリソースが必要になります。これらのリソースは使用後に解放されます。

</Admonition>

さらに、RESTful API を使用してクエリCUを手動でスケーリングすることもできます。

以下の例では、既存のクラスターを2 CUにスケーリングします。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```
