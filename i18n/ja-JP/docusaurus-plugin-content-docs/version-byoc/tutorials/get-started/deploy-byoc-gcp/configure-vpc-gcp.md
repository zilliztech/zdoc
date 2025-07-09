---
title: "GCP上で顧客管理型VPCを設定する | BYOC"
slug: /configure-vpc-gcp
sidebar_label: "GCP上で顧客管理型VPCを設定する"
beta: CONTACT SALES
notebook: FALSE
description: "Zilliz CloudBring-Your-Own-Cloud(BYOC)ソリューションを使用すると、独自のVirtual Private Cloud(VPC)内でプロジェクトを設定できます。お客様が管理するVPCでZilliz Cloudプロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 | BYOC"
type: origin
token: C94rw7r38ij0eCkvQKBcEFJ1n0e
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# GCP上で顧客管理型VPCを設定する

Zilliz CloudBring-Your-Own-Cloud(BYOC)ソリューションを使用すると、独自のVirtual Private Cloud(VPC)内でプロジェクトを設定できます。お客様が管理するVPCでZilliz Cloudプロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 

このページでは、これらの要件を満たす顧客管理VPCでZilliz Cloud BYOCプロジェクトをホストするための最小要件を列挙しています。 

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## VPCの要件{#vpc-requirements}

Zilliz Cloudプロジェクトをホストするには、VPCがこのセクションで列挙された要件を満たす必要があります。BYOCプロジェクトに既存のVPCを使用する場合は、VPCがこれらの要件を満たしていることを確認してください。 

### VPCリージョン{#vpc-regions}

以下の表は、Zilliz Cloud BYOCソリューションがサポートするGoogle Cloud Platform（GCP）のリージョンを示しています。Zilliz Cloudコンソールでクラウドリージョンが見つからない場合は、support@zilliz.comまでお問い合わせください。

<table>
   <tr>
     <th><p>GCPリージョン</p></th>
     <th><p>ロケーション</p></th>
   </tr>
   <tr>
     <td><p>us-westとは</p></td>
     <td><p>オレゴン州</p></td>
   </tr>
</table>

### VPCのIPアドレス範囲{#vpc-ip-address-ranges}

Zilliz Cloudは、VPCのIPv 4 CIDR設定で**/18**ネットマスクを使用し、CIDRブロックからパブリックサブネットと3つのプライベートサブネットを作成することを推奨しています。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、Zilliz CloudはIPv 4 CIDRブロックのみをサポートしています。</p>

</Admonition>

### サブネット{#subnets}

Zilliz Cloud BYOCプロジェクトには、プライマリIPv 4範囲と2つのセカンダリIPv 4範囲を持つ1つのプライマリサブネットと、別々の負荷分散サブネットが必要です。

### クラウドルーターとNAT{#cloud-router-and-nat}

VPCと他のネットワーク間の動的なルート交換を可能にするには、Google Cloud Routerが必要です。また、VPC上のVMとコンテナポッドがZilliz CloudのVPCネットワークと通信できるように、NATゲートウェイを追加する必要があります。

### ファイアウォールルール{#firewall-rules}

2つのイングレスファイアウォールルールを作成する必要があります。1つは、BYOCプロジェクト内のクラスタに対してZilliz Cloudがヘルスチェックを実行するためのもので、もう1つは、VPCネットワーク内のVMインスタンスが互いに通信するためのものです。

### Private Service Connect(PSC)エンドポイント{#private-service-connect-psc-endpoint}

PSCエンドポイントはオプションであり、BYOCクラスターのプライベートエンドポイントを構成するときに使用されます。 

## 手続き{#procedure}

GCPダッシュボードでは、[VPCの要件](./configure-vpc-gcp#vpc-requirements)で列挙されたVPCおよび関連リソースを作成できます。また、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをGCP上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

### ステップ1: VPCネットワークを作成し、プライマリサブネットを追加します{#step-1-create-a-vpc-network-and-add-the-primary-subnet}

この手順では、VPCネットワークを作成し、プライマリサブネットを追加します。プライマリサブネットには、コンテナポッドとサービス用のプライマリIPv 4アドレス範囲と2つのセカンダリIPv 4アドレス範囲が含まれます。

<Supademo id="cmbhlqpyr5ovksn1rjtbv93bt" title=""  />

VPCネットワークを作成し、プライマリサブネットを追加する手順は次のとおりです。

1. GCPコンソールで、**VPCネットワーク**を見つけてクリックしてください。

1. **VPCネットワークの作成**をクリックしてください。

1. 作成するVPCとプライマリサブネットの名前を設定します。

    このデモでは、`primary-subnet`に設定するか、命名規則に従ってサブネットに名前を付けることができます。

1. プライマリサブネットのリージョンを選択します。

    地域はあなたのZilliz BYOCプロジェクトと同じである必要があります。

1. プライマリサブネットのプライマリIPv 4範囲を設定します。

    このデモでは、`10.7.0.0/18`に設定するか、計画されたネットワークセグメントを使用できます。

1. コンテナポッドのセカンダリIPv 4範囲の名前とIPv 4アドレス範囲を設定します。

    このデモでは、名前を`pod-subnet`に設定し、範囲を`10.7.64.0/18`に設定するか、命名規則とネットワークプランに従うことができます。

1. [セカンダリIPv 4範囲の追加]をクリックして、サービスのセカンダリIPv 4範囲を追加し、その名前と範囲を設定します。

    このデモでは、名前を`service-subnet`に設定し、範囲を`10.7.128.0/18`に設定するか、命名規則とネットワークプランに従うことができます。

1. 残りはデフォルト設定のままにして、**作成**をクリックしてください。

### ステップ2:負荷分散サブネットを追加する{#step-2-add-the-load-balancing-subnet}

この手順では、リージョナルApplication Load Balancer用に予約されたプロキシ専用サブネットを追加します。

<Supademo id="cmbhmkul05p81sn1r161bhqiy" title=""  />

このサブネットを追加する手順は次のとおりです。

1. GCPコンソールで、**VPCネットワーク**を見つけてクリックしてください。

1. 前のステップで作成したVPCネットワークをフィルタリングします。

1. 名前をクリックすると詳細が表示されます。

1. 「サブネット」タブに切り替え、「サブネットの追加」をクリックしてください。

1. 作成するサブネットの名前を設定します。

    このデモでは、`lb-subnet`に設定するか、命名規則に従ってサブネットに名前を付けることができます。

1. プライマリサブネットのリージョンを選択します。

    地域はあなたのZilliz BYOCプロジェクトと同じである必要があります。

1. 「目的」で「リージョナルマネージドプロキシ」を選択してください。

    このオプションとプロキシのみのサブネットの詳細については、[この文書](https://cloud.google.com/load-balancing/docs/proxy-only-subnets)を参照してください。

1. このサブネットのプライマリIPv 4範囲を設定します。

    このデモでは、`10.7.192.0/18`に設定するか、計画されたネットワークセグメントを使用できます。

1. 「追加」をクリックしてください。

### ステップ3:クラウドルーターとNATゲートウェイの設定{#step-3-set-up-the-cloud-router-and-nat-gateway}

クラウドルーターとNATゲートウェイを設定して、VPCとZilliz Cloud間のトラフィックのネットワークアドレス変換を有効にします。

<Supademo id="cmbhobhu95slrsn1r9uig4txt" title=""  />

クラウドルーターとNATゲートウェイの設定手順は次のとおりです。

1. GCPコンソールで、**ネットワーク接続**を見つけてクリックしてください。

1. 左のナビゲーションペインで**Cloud Router**を選択してください。

1. 「ルーターの作成」をクリックしてください。

1. 作成するルータの名前を設定します。

    このデモでは`your-org-byoc-router`に設定するか、命名規則に従ってください。

1. 前のステップで作成したVPCネットワークを選択してください。

    このデモでは、`your-org-byoc-vpc`を選択します。

1. ルーターを作成するリージョンを選択します。

    このデモでは、`us-west1 (Oregon)`を選択します。

1. 「作成」をクリックしてください。

1. ルーターのリストにあるルーターの名前をクリックしてください。

1. 下にスクロールして、**Cloud NATゲートウェイの追加**をクリックしてください。

1. 作成するNATゲートウェイの名前を設定します。

    このデモでは`your-org-byoc-nat`に設定するか、命名規則に従ってください。

1. **クラウドNAT IPアドレス**で**マニュアル**を選択してください。

    以下のように新しいIPアドレスを作成する必要があります。

    1. 「IPアドレス1」のドロップダウンリストから「IPアドレスを作成」を選択してください。

    1. プロンプトされたダイアログボックスで、予約するIPアドレスの名前を設定し、**予約**をクリックしてください。

        このデモでは`your-org-byoc-nat-ip`に設定するか、命名規則に従ってください。

1. 新しいIPアドレスがNATゲートウェイ用に予約されたら、**作成**をクリックしてください。

### ステップ4:ファイアウォールルールを追加する{#step-4-add-firewall-rules}

このステップでは、2つのファイアウォールルールを追加します。最初のルールは、VPCネットワークにデプロイされたBYOCクラスターに対するヘルスチェックを有効にすることであり、2番目のルールは、ターゲットタグ`zilliz-byoc`を持つすべてのVM間の通信を有効にすることです。

<Supademo id="cmbj0hb9p7c84sn1r5q4o16k0" title=""  />

これらのファイアウォールルールを追加する手順は次のとおりです。

1. GCPコンソールで、**VPCネットワーク**を見つけてクリックしてください。

1. 前のステップで作成したVPCネットワークをフィルタリングします。

1. VPCネットワークの名前をクリックして詳細を表示します。

1. 「ファイアウォール」タブに切り替えてください。

1. 「ファイアウォールルールの追加」をクリックしてください。

    - BYOCクラスターに対するヘルスチェックのファイアウォールルール。

        <table>
           <tr>
             <th><p><strong>お名前</strong></p></th>
             <th><p>ingress-rule-for-health-checks</p></th>
           </tr>
           <tr>
             <td><p><strong>ターゲット</strong></p></td>
             <td><p>ネットワーク内のすべてのインスタンス</p></td>
           </tr>
           <tr>
             <td><p><strong>ソースIPv 4範囲</strong></p></td>
             <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
           </tr>
           <tr>
             <td><p><strong>プロトコルとポート</strong></p></td>
             <td><p>指定されたプロトコルとポート</p></td>
           </tr>
           <tr>
             <td><p><strong>TCPの</strong></p></td>
             <td><p>インラインコードプレースホルダー0</p></td>
           </tr>
        </table>

    - VPCネットワーク上のタグ付きVM間のローカルトラフィックのファイアウォールルール

        <table>
           <tr>
             <th><p><strong>お名前</strong></p></th>
             <th><p>ingress-rule-for-local-traffic</p></th>
           </tr>
           <tr>
             <td><p><strong>ターゲット</strong></p></td>
             <td><p>指定されたターゲットタグ</p></td>
           </tr>
           <tr>
             <td><p><strong>ターゲットタグ</strong></p></td>
             <td><p>インラインコードプレースホルダー0</p></td>
           </tr>
           <tr>
             <td><p><strong>ソースIPv 4範囲</strong></p></td>
             <td><p><a href="./configure-vpc-gcp#step-1-create-a-vpc-network-and-add-the-primary-subnet">プライマリサブネットのIPv 4アドレス範囲</a></p></td>
           </tr>
           <tr>
             <td><p><strong>プロトコルとポート</strong></p></td>
             <td><p>すべてを許可する</p></td>
           </tr>
        </table>

### ステップ5:（オプション）PSCエンドポイントを作成する{#step-5-optional-create-a-psc-endpoint}

VPCとZilliz Cloud間の通信がインターネットから遮断されるように、PSCエンドポイントを追加します。

<Supademo id="cmbj22gip7cyqsn1r4kes9547" title=""  />

PSCエンドポイントを作成する手順は次のとおりです。

1. GCPコンソールで、**ネットワークサービス**を見つけてクリックしてください。

1. 左のナビゲーションペインから**Private Service Connect**を選択してください。

1. 「エンドポイントに接続」をクリックしてください。

1. 「ターゲット」で「公開サービス」を選択してください。

1. Zilliz Cloudが提供する**ターゲット詳細**にサービス添付IDを入力してください。

    次の表に、利用可能な各クラウドリージョンに固有のサービス添付ファイルIDを示します。

    <table>
       <tr>
         <th><p>地域</p></th>
         <th><p>サービスアタッチメントID</p></th>
       </tr>
       <tr>
         <td><p>us-westとは</p></td>
         <td><p>インラインコードプレースホルダー0</p></td>
       </tr>
    </table>

1. エンドポイントサービスの名前を設定します。

1. 前の手順で作成したVPCネットワークとそのプライマリサブネットを選択してください。

1. エンドポイントにIPアドレスを割り当てます。

    プロンプトされたダイアログボックスで、以下の手順を実行してください:

    1. **IPアドレスを作成**をクリックしてください。

    1. IPアドレスの名前を設定します。

    1. 「静的IPアドレス」で「自動的に割り当てる」を選択してください。

    1. 予約を作成してください。

1. 「エンドポイントを追加」をクリックしてください。

