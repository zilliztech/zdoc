---
title: "クエリ CU のスケール | BYOC"
slug: /scale-query-cu
sidebar_key: scale-query-cu
sidebar_label: "クエリ CU のスケール"
beta: FALSE
notebook: FALSE
description: "ワークロードの増大やデータ書き込みの増加に伴い、サービングクラスターが容量制限に達する可能性があります。その場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。 | BYOC"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - スケール
  - 管理
  - クエリ cu

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クエリ CU のスケーリング

ワークロードの増加やデータ書き込みの拡大に伴い、サービングクラスターが容量制限に達する可能性があります。そのような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。

これを事前に管理するため、[メトリクス](./metrics-alerts-reference) ページで**クエリ** **CU 容量**を監視し、クエリ CU のスケーリングが必要な時期を判断できます。ビジネスニーズやパターンに基づき、クエリ CU 数を増やしてクラスター容量を拡張したり、需要が減少した際に CU 数を減らしてコストを削減したりできます。

なお、1〜12 CU のサービングクラスターでは、クエリ CU を直接スケーリングできます。12 CU を超えるサービングクラスターの場合は、[レプリカ](./manage-replica) を増やす必要があります。

本ガイドでは、変化するワークロードに合わせてサービングクラスターのサイズを変更する方法について説明します。

## 考慮事項\{#considerations}

- **リソースの制限**: 

    - **スケールアップ**

        - Dedicated (Standard) クラスター: 最大 32 CU

            Dedicated (Enterprise) クラスター: 最大 1,024 CU

        - **クエリ CU 数** × **レプリカ数** の積は 10,240 を超えてはなりません

        より大きなクエリ CU が必要な場合は、[営業担当者にお問い合わせください](http://zilliz.com/contact-sales)。

    - **スケールダウン**

        - レプリカを持つクラスターは、12 CU 未満にスケールダウンできません

        - スケールダウンリクエストが成功するのは、以下の条件を満たす場合のみです:

            - 現在のデータ量が、新しい CU サイズの CU 容量の 80% 未満であること。

            - 現在のコレクションおよびパーティション数が、新しい CU サイズで許可される [コレクションおよびパーティションの最大数](./limits#collections) 未満であること。

- **スケーリング中**: クラスターのステータスが「変更中」に変化し、その間は操作を実行できません。複数のスケーリングタスクがトリガーされた場合、トリガータイムスタンプに基づいて順次処理されます。完了時間はデータ量に依存します。

- **パフォーマンスへの影響**: スケーリングにより、わずかなサービスジッターが発生する可能性があります。

- **バックアップの制限**: 動的スケーリングおよびスケジュールされたスケーリングの設定は、[バックアップ](./create-snapshot) に含まれません。クラスターを復元した後、これらの設定を手動で再構成してください。

## 手動スケーリング\{#manual-scaling}

Zilliz Cloud コンソールまたは RESTful API を使用して、クラスターを手動でスケールアップまたはスケールダウンできます。

以下のデモでは、Zilliz Cloud Web コンソール上でクラスターを手動でスケールアップおよびスケールダウンする方法を示します。

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p><strong>クエリノード CU のスケーリング</strong> ダイアログボックスで<strong>保存</strong>をクリックすると、プロジェクトのリソース割当量を確認するよう促されます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。そうでない場合は、</p>
<ul>
<li><p><strong>プロジェクトのリソース設定へ移動</strong> をクリックしてプロジェクトのリソース設定を編集するか、</p></li>
<li><p><strong>前のステップに戻る</strong> をクリックしてクラスター設定を変更してください。</p></li>
</ul>
<p>プロセス中に、ローリング用に追加のリソースが必要になります。これらのリソースは使用後に解放されます。</p>

</Admonition>

さらに、RESTful API を使用してクエリ CU を手動でスケーリングすることもできます。

以下の例では、既存のクラスターを 2 CU にスケーリングします。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) をご覧ください。

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

