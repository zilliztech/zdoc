---
title: "スイッチオーバーとフェイルオーバー | Cloud"
slug: /switchover-and-failover
sidebar_label: "スイッチオーバーとフェイルオーバー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のグローバルクラスターは、どのリージョンがプライマリクラスターをホストするかを変更する 2 つの操作をサポートします | Cloud"
type: origin
token: D7F1wYcfVinn92kK0l5cTZDLnLf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# スイッチオーバーとフェイルオーバー

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能はすべての AWS リージョンと、以下の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud のグローバルクラスターは、どのリージョンがプライマリクラスターをホストするかを変更する 2 つの操作をサポートしています。

- **スイッチオーバー**: 同期済みのセカンダリクラスターをプライマリに昇格させる、計画的でデータ損失ゼロの操作です。

- **フェイルオーバー**: プライマリリージョンで障害が発生した後、セカンダリクラスターをプライマリに昇格させる緊急復旧操作です。

このページでは、各操作をいつ使用するか、実行方法、実行中および実行後に何が起こるかを説明します。

## 概要\{#overview}

### スイッチオーバーとフェイルオーバーの比較\{#switchover-vs-failover}

以下の表は、この 2 つの操作を比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>スイッチオーバー</strong></p></th>
     <th><p><strong>フェイルオーバー</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>使用するタイミング</strong></p></td>
     <td><p>計画された操作: リージョンの切り替え、コンプライアンス要件、データレジデンシーの変更。</p></td>
     <td><p>プライマリリージョンでの想定外の停止または障害。</p></td>
   </tr>
   <tr>
     <td><p><strong>トリガー</strong></p></td>
     <td><p>すべてのプライマリおよびセカンダリクラスターが実行中のときに手動で開始します。</p></td>
     <td><p>プライマリクラスターが異常状態になったときに、復旧アクションとして手動で開始します</p></td>
   </tr>
   <tr>
     <td><p><strong>データ損失 (RPO)</strong></p></td>
     <td><p>0 — データ損失はありません。昇格は完全なデータ同期後にのみ行われます。</p></td>
     <td><p>フェイルオーバー時点の同期遅延に等しくなります。</p></td>
   </tr>
   <tr>
     <td><p><strong>ダウンタイム (RTO)</strong></p></td>
     <td><p>ほぼゼロです。グローバルエンドポイントが自動的に再ルーティングします。</p></td>
     <td><p>通常は数分程度です。</p></td>
   </tr>
   <tr>
     <td><p><strong>前提条件</strong></p></td>
     <td><ul><li><p>すべてのクラスターが RUNNING ステータスである必要があります。</p></li><li><p>同期遅延は 30 秒以下である必要があります。このしきい値を超える場合、スイッチオーバーは拒否されます。</p></li></ul></td>
     <td><ul><li><p>いつでもトリガーできます（高リスクの操作）。</p></li><li><p>少なくとも 1 つのセカンダリクラスターに到達可能である必要があります。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>旧プライマリクラスターの扱い</strong></p></td>
     <td><p>セカンダリクラスターに降格されます。</p></td>
     <td><p>破棄され、<a href="./use-recycle-bin">ごみ箱</a> に移動されます。新しいセカンダリが自動的に作成されます。</p></td>
   </tr>
   <tr>
     <td><p><strong>アプリケーションの変更</strong></p></td>
     <td><p>グローバルエンドポイントを使用している場合は不要です。ルーティングは自動的に更新されます。詳細は <a href="./connect-to-global-cluster">グローバルクラスターへの接続</a> を参照してください</p></td>
     <td><p>グローバルエンドポイントを使用している場合は不要です。ルーティングは自動的に更新されます。詳細は <a href="./connect-to-global-cluster">グローバルクラスターへの接続</a> を参照してください</p></td>
   </tr>
</table>

### クラスターステータスの遷移\{#cluster-status-transitions}

以下の図は、スイッチオーバー、フェイルオーバー、および自動復旧の各操作中にクラスターのステータスがどのように変化するかを示しています。

![JO4VwcCq5hlf7Qb6khwcmdDKnJf](https://zdoc-images.s3.us-west-2.amazonaws.com/JO4VwcCq5hlf7Qb6khwcmdDKnJf.png)

- **スイッチオーバー:**

    - スイッチオーバーでは、対象のセカンダリが現在のプライマリと同期する間、クラスターは **RUNNING** から **SWITCHING** に遷移します。同期が完了すると、対象のセカンダリが新しいプライマリに昇格し、元のプライマリはセカンダリに降格されます。両方のクラスターは新しい役割で **RUNNING** に戻ります。

    - タイムアウト期間内に同期が完了しない場合、スイッチオーバーはロールバックされます。両方のクラスターは元の役割を維持したまま **RUNNING** に戻ります。

- **フェイルオーバー**:

    - 障害または停止によりプライマリクラスターが **ABNORMAL** ステータスになった場合、フェイルオーバーをトリガーできます。対象のセカンダリは新しいプライマリに昇格し、古いプライマリは破棄されてごみ箱に移動されます。

    - フェイルオーバーが完了すると、Zilliz Cloud は完全なトポロジーを復元するために新しいセカンダリクラスターを自動的に作成します。新しいセカンダリと残りのすべてのセカンダリクラスターは **CREATING** ステータスで開始し、プロビジョニングとデータ同期が完了すると **RUNNING** に遷移します。作成に失敗した場合、クラスターは **REBUILD_FAILED** ステータスになります。再構築を再試行するか、サポートが必要な場合は [お問い合わせ](http://support.zilliz.com) ください。

    - フェイルオーバー自体が失敗した場合、クラスターは **ABNORMAL** ステータスのままになります。フェイルオーバーを再試行するか、サポートが必要な場合は [お問い合わせ](http://support.zilliz.com) ください。

- **自動復旧**:

    プライマリクラスターの問題が自然に解消した場合、手動操作なしでクラスターは **ABNORMAL** から **RUNNING** に戻ります。この場合、フェイルオーバーは不要です。

## スイッチオーバーの実行\{#perform-a-switchover}

計画的なリージョン切り替えでは、スイッチオーバーを実行してセカンダリクラスターをプライマリの役割に昇格できます。

### 開始する前に\{#before-you-start}

- グローバルクラスター内のすべてのクラスターが **RUNNING** ステータスである必要があります。

- 同期遅延は 30 秒以下である必要があります。このしきい値を超える場合、スイッチオーバーは拒否されます。遅延は [Global Topology](./monitor-global-cluster#global-topology) タブで確認してください。

- Query CU または Replica の [スケーリング](./scale-global-cluster) 操作が進行中であってはなりません。

### 手順\{#procedures}

- **Web コンソールから**

    次のデモは、スイッチオーバーの実行方法を示しています。

    <Supademo id="cmnpic07n84n2aburnc12drnr" title=""  />

    <Procedures>

    1. **Global Cluster** ページに移動します。

    1. **Switchover or Failover** をクリックします。

    1. 昇格する対象のセカンダリクラスターを選択します。

    1. Switchover を選択します。

    1. ダイアログで操作を確認します。

    </Procedures>

    スイッチオーバーを開始すると、Zilliz Cloud は対象のセカンダリが現在のプライマリと完全に同期するのを待ってから、新しいプライマリに昇格させます。 

- **RESTful API から**

    次の例は、クラスター `in01-secondary` が新しいプライマリクラスターになるようにスイッチオーバーを実行します。API の詳細については、[Switchover Global Cluster](/reference/restful/switchover-global-cluster-v2) を参照してください。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/globalClusters/${globalClusterId}/switchover" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "newPrimaryClusterId": "in01-secondary"
    }'
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "oldPrimaryClusterId": "in01-primary",
        "newPrimaryClusterId": "in01-secondary",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

### スイッチオーバー後\{#after-the-switchover}

- 元のプライマリはセカンダリクラスターになり、新しいプライマリからのレプリケートデータの受信を開始します。

- グローバルエンドポイントのルーティングは自動的に更新され、書き込みが新しいプライマリに送られるようになります。

- 新しい **Global Topology** ビューで確認できます。すべてのクラスターは RUNNING ステータスに戻っているはずです。

- 新しいプライマリクラスターでバックアップポリシーを再設定してください。バックアップポリシーは新しいプライマリに自動的には引き継がれません。

## フェイルオーバーの実行\{#perform-a-failover}

プライマリリージョンで障害が発生し、プライマリクラスターが ABNORMAL ステータスになっている場合はフェイルオーバーを使用します。

フェイルオーバーは緊急操作です。スイッチオーバーとは異なり、完全なデータ同期を待ちません。プライマリでコミット済みでも、対象のセカンダリにまだレプリケートされていない書き込みは失われます。データ損失量はフェイルオーバー時点の同期遅延に等しくなります。

### 開始する前に\{#before-you-start}

- プライマリクラスターが到達不能であり、ABNORMAL ステータスであることを確認してください。

- 昇格するセカンダリクラスターを特定します。複数のセカンダリが利用可能な場合は、同期遅延が最も小さいもの（プライマリの最新状態に最も近いもの）を選択してください。

### 手順\{#procedures}

- **Web コンソールから**

    次のデモは、フェイルオーバーの実行方法を示しています。

    <Supademo id="cmnpile4s01nlzz0j6ryixd11" title=""  />

    <Procedures>

    1. **Global Cluster** ページに移動します。

    1. **Switchover or Failover** をクリックします。

    1. 昇格する対象のセカンダリクラスターを選択します。

    1. Failover を選択します。

    1. ダイアログで操作を確認します。

    </Procedures>

    <Admonition type="info" icon="📘" title="注意">

    フェイルオーバーが失敗した場合、クラスターは ABNORMAL ステータスのままになります。フェイルオーバー操作を再試行するか、[サポートチケットを作成](http://support.zilliz.com)してください。

    </Admonition>

- **RESTful API から** 

    次の例は、クラスター `in01-secondary` が強制的にプライマリに昇格されるようにフェイルオーバーを実行します。API の詳細については、[Failover Global Cluster](/reference/restful/failover-global-cluster-v2) を参照してください。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/failover" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "newPrimaryClusterId": "in01-secondary"
      }'
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "oldPrimaryClusterId": "in01-primary",
        "newPrimaryClusterId": "in01-secondary",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

### フェイルオーバー後\{#after-the-failover}

- 元のプライマリは破棄され、ごみ箱に移動されます。**Global Topology** ビューには表示されなくなります。

- 完全なグローバルトポロジーを復元するために、新しいセカンダリクラスターが自動的に作成されます。新しいセカンダリのプロビジョニング中は、グローバルトポロジーからは見えません。代わりに、グローバルクラスターのページに次のバナーが表示されます: *"A new secondary cluster will be created and become available shortly."*

- 残りのセカンダリクラスターも再構築のために CREATING ステータスに遷移し、再構築完了後に RUNNING になります。

- グローバルエンドポイントは更新され、書き込みを新しいプライマリに送るようになります。

- 新しいプライマリクラスターでバックアップポリシーを再設定してください。バックアップポリシーは新しいプライマリに自動的には引き継がれません。

## ルーティング動作\{#routing-behavior}

以下の表は、各操作の実行中および完了後に、グローバルエンドポイントとパブリックエンドポイントがどのように動作するかをまとめたものです。

<table>
   <tr>
     <th><p><strong>エンドポイントの種類</strong></p></th>
     <th><p><strong>スイッチオーバー中</strong></p></th>
     <th><p><strong>フェイルオーバー中</strong></p></th>
     <th><p><strong>完了後</strong></p></th>
   </tr>
   <tr>
     <td><p>グローバルエンドポイント</p></td>
     <td><ul><li><p>書き込みは短時間停止し、その後新しいプライマリにルーティングされます。</p></li><li><p>読み取りは継続されます。</p></li></ul></td>
     <td><ul><li><p>新しいプライマリが昇格されるまで書き込みは利用できません。</p></li><li><p>読み取りはセカンダリで利用できます。</p></li></ul></td>
     <td><ul><li><p>書き込みと読み取りは自動的に新しいプライマリおよびセカンダリへルーティングされます。</p></li><li><p>コード変更は不要です。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>パブリックエンドポイント</p></td>
     <td><ul><li><p>各クラスターのパブリックエンドポイントは変更されません。</p></li><li><p>古いプライマリはセカンダリになります。</p></li></ul></td>
     <td><ul><li><p>古いプライマリは破棄されます。</p></li><li><p>新しいプライマリのパブリックエンドポイントは書き込みを受け付けます。</p></li></ul></td>
     <td><ul><li>書き込みに新しいプライマリのパブリックエンドポイントを使用するよう、アプリケーションを更新してください。</li></ul></td>
   </tr>
</table>

## 進行中のタスクへの影響\{#impact-on-in-progress-tasks}

以下の表は、進行中のタスクがスイッチオーバーおよびフェイルオーバー中にどのように処理されるかをまとめたものです。

| **タスク** | **スイッチオーバー中** | **フェイルオーバー中** |
| --- | --- | --- |
| バックアップ | タスクは失敗します。スイッチオーバー完了後に新しいプライマリで自動的に再試行されます。 | タスクは失敗します。フェイルオーバー完了後に新しいプライマリで自動的に再試行されます。 |
| Query CU スケーリング | スケーリングの進行中はスイッチオーバーはブロックされます。 | タスクは失敗します。フェイルオーバー完了後に再試行されます。 |
| Replica スケーリング | スケーリングの進行中はスイッチオーバーはブロックされます。 | タスクは失敗します。フェイルオーバー完了後に再試行されます。 |
