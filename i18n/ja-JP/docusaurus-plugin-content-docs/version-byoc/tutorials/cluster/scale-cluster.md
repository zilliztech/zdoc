---
title: "スケールクラスタ | BYOC"
slug: /scale-cluster
sidebar_label: "スケールクラスタ"
beta: FALSE
notebook: FALSE
description: "データが増えるにつれて、データの書き込みに影響を与える制約に直面する可能性があります。たとえば、読み取り操作は機能し続けますが、クラスタが最大容量に達すると、新しいデータの挿入または挿入が失敗する可能性があります。 | BYOC"
type: origin
token: XGrbwNm3OiDxstkfMMTcf1Tenkc
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus

---

import Admonition from '@theme/Admonition';


# スケールクラスタ

データが増えるにつれて、データの書き込みに影響を与える制約に直面する可能性があります。たとえば、読み取り操作は機能し続けますが、クラスタが最大容量に達すると、新しいデータの挿入または挿入が失敗する可能性があります。

このような問題に対処するために、ワークロードやストレージ要件の変動に合わせてCUの数を調整することができます。CPUまたはメモリ使用量の増加に応じてCUをスケーリングアップすることでクラスタのパフォーマンスを向上させ、需要が低い期間にコストを削減するためにスケールダウンすることができます。

このガイドでは、クラスタのスケーリング手順について説明します。

## 手動スケーリング{#manual-scaling}

Zilliz CloudのWebコンソールを使用するか、APIリクエストを行ってクラスターを手動でスケーリングするオプションがあります。このガイドでは、Webコンソールを使用してクラスターを手動でスケーリングする方法に焦点を当てています。RESTful APIの使用方法の詳細については、[クラスター変更](/reference/restful/modify-cluster-v2)を参照してください。

<Admonition type="caution" icon="🚧" title="警告">

<p>スケーリングにより、わずかなサービスジッターが発生する可能性があります。注意してください。</p>

</Admonition>

### クラスタをスケールアップする{#scale-up-a-cluster}

![manual-scale-entry](/byoc/ja-JP/manual-scale-entry.png)

[クラスタのスケール]ダイアログボックスでは、元のクラスタと同じクラウドリージョン内の同じタイプのクラスタに割り当てられた体格をスケールアップできます。

- Dedicated(Standard)クラスターの場合、体格を最大32 CUまで拡張できます。

- 専用(エンタープライズ)クラスターの場合、最大256 CUまでスケールアップできます。

より大きなCU体格が必要な場合は、[サポートチケットを作成](http://support.zilliz.com/)してください。

<Admonition type="info" icon="📘" title="ノート">

<p>クラスターのCUサイズx<a href="./manage-replica">レプリカ</a>数は256を超えてはいけません。そうしないと、クラスターのスケーリングに失敗する可能性があります。</p>

</Admonition>

### クラスタを縮小する{#scale-down-a-cluster}

![manual-scale-entry](/byoc/ja-JP/manual-scale-entry.png)

「**スケールクラスタ**」ダイアログボックスで、ダイアログウィンドウで希望のCU体格を選択します。「**スケール**」をクリックすると、Zilliz Cloudはクラスタのデータ量とコレクション番号を確認します。スケールダウンは、以下の2つの条件の両方が満たされた場合にのみ正常にトリガーされます

- 現在のデータ量は、新しいCU体格のCU容量の80%未満です。

- 現在のコレクション数新しいCUスタイルで許可される[コレクションの最大数](./limits#collections)。

この過程を完了するのに必要な時間は、クラスタ内のデータ量によって異なります。

<Admonition type="info" icon="📘" title="ノート">

<p>クラスターのCU体格を8 CU未満に縮小するには、クラスターにレプリカがないことを確認してください。</p>

</Admonition>

## QPSを増やす{#increase-qps}

QPSとクエリのスループットを向上させるには、レプリカの追加を検討してください。詳細については、「[レプリカの管理](./manage-replica)」を参照してください。

