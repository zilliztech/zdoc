---
title: "AWS上で顧客管理型VPCを設定する | BYOC"
slug: /configure-vpc
sidebar_label: "AWS上で顧客管理型VPCを設定する"
beta: CONTACT SALES
notebook: FALSE
description: "Zilliz CloudBring-Your-Own-Cloud(BYOC)ソリューションを使用すると、独自のVirtual Private Cloud(VPC)内でプロジェクトを設定できます。お客様が管理するVPCでZilliz Cloudプロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 | BYOC"
type: origin
token: U3mEwtr42i7GJsk25nzcc4KonUc
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - aws
  - vpc
  - security group
  - vpc endpoint
  - subnet
  - milvus
  - vector database
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication

---

import Admonition from '@theme/Admonition';


# AWS上で顧客管理型VPCを設定する

Zilliz CloudBring-Your-Own-Cloud(BYOC)ソリューションを使用すると、独自のVirtual Private Cloud(VPC)内でプロジェクトを設定できます。お客様が管理するVPCでZilliz Cloudプロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 

このページでは、これらの要件を満たす顧客管理VPCでZilliz Cloud BYOCプロジェクトをホストするための最小要件を列挙しています。 

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## VPCの要件{#vpc-requirements}

Zilliz Cloudプロジェクトをホストするには、VPCがこのセクションで列挙された要件を満たす必要があります。BYOCプロジェクトに既存のVPCを使用する場合は、VPCがこれらの要件を満たしていることを確認してください。 

### VPCリージョン{#vpc-regions}

以下の表は、Zilliz Cloud BYOCソリューションがサポートするAWSクラウドリージョンを示しています。Zilliz Cloudコンソールでクラウドリージョンが見つからない場合は、support@zilliz.comまでお問い合わせください。

<table>
   <tr>
     <th><p>AWSリージョン</p></th>
     <th><p>ロケーション</p></th>
   </tr>
   <tr>
     <td><p>us-west-2ファイル</p></td>
     <td><p>オレゴン州</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1ダウンロード</p></td>
     <td><p>フランクフルト</p></td>
   </tr>
</table>

### VPCのIPアドレス範囲{#vpc-ip-address-ranges}

Zilliz Cloudは、VPCのIPv 4 CIDR設定で**/16**ネットマスクを使用し、CIDRブロックからパブリックサブネットと3つのプライベートサブネットを作成することを推奨しています。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、Zilliz CloudはIPv 4 CIDRブロックのみをサポートしています。</p>

</Admonition>

### サブネット{#subnets}

Zilliz Cloudプロジェクトには、1つのパブリックサブネットと3つのプライベートサブネットが必要で、各プライベートサブネットは異なる可用性ゾーンにあります。 

パブリックサブネットはNATゲートウェイをホストし、ネットマスクは**/24**です。各プライベートサブネットのネットマスクは**/18**であり、EKSクラスター内でApplication Load Balancer(ALB)Ingressルーティングを使用するために`kubernetes.io/role/internal-elb=1`でタグ付けする必要があります。 

ALBがEKSクラスター内のポッドに対してアプリケーションとHTTPトラフィックをルーティングする方法の詳細については、[この記事](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html)を参照してください。

### DNSサポート{#dns-support}

VPCにはDNSホスト名とDNS解決が有効になっている必要があります。

### NATゲートウェイ{#nat-gateway}

Zilliz Cloudは、プライベートサブネット内のリソースがインターネットに到達できるように、パブリックサブネットに単一のNATゲートウェイを設定します。ただし、外部サービスはプライベートサブネット内のリソースとの接続を開始できません。

### セキュリティグループ{#security-group}

イングレスルールはポート443を開く必要があります。セキュリティグループの作成の詳細については、[ステップ2:セキュリティグループを作成する](./configure-vpc#step-2-create-a-security-group)を参照してください。

### VPCエンドポイント{#vpc-endpoint}

VPCエンドポイントはオプションであり、BYOCクラスターのプライベートエンドポイントを構成する必要がある場合に使用されます。セキュリティグループの作成の詳細については、[ステップ3:（オプション）VPCエンドポイントを作成する](./configure-vpc#step-3-optional-create-a-vpc-endpoint)を参照してください。

## 手続き{#procedure}

AWSコンソールを使用してVPCおよび関連リソースを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

### ステップ1: VPCとリソースを作成する{#step-1-create-vpc-and-resources}

AWSコンソールでは、[VPCの要件](./configure-vpc#vpc-requirements)に列挙されたVPCと関連リソースを作成できます。

1. AWSのVPCダッシュボードに移動してください。

1. 右上隅のリージョンドロップダウンでクラウドリージョンを確認し、Zilliz Cloudプロジェクトのリージョンに変更してください。

1. **Create VPC**ボタンをクリックしてください。

1. **VPC設定**で、以下のスナップショットに示すように設定してください。

![create-aws-vpc-byoc](/img/create-aws-vpc-byoc.png)

1. **VPCの作成**をクリックしてください。

1. VPCが作成されたら、詳細をスクロールして**VPCを表示**をクリックしてください。

1. 「詳細」セクションで、VPC IDをコピーし、Zilliz Cloudに貼り付けてください。

    ![Rkj2bzxw0ocgLzxE63AcJ0VEnHe](/img/Rkj2bzxw0ocgLzxE63AcJ0VEnHe.png)

1. [リソースマップ]セクションで、各プライベートサブネットの末尾にある[外部リンク]アイコンをクリックして、詳細を表示します。

    ![VecQbx7epoBqABx8vKOcaIS7nDd](/img/VecQbx7epoBqABx8vKOcaIS7nDd.png)

1. [サブネットの詳細]ページで、サブネットIDをコピーします。 

    ![GPimbEY2Aoz5UtxUCxkcqrAYnjc](/img/GPimbEY2Aoz5UtxUCxkcqrAYnjc.png)

1. 次に、「タグの管理」をクリックしてください。開かれたページで、「新しいタグを追加」をクリックし、新しいタグリストエントリの「キー」を`kubernetes.io/role/internal-elb`に設定し、「値」を`1`に設定してください。そして、「保存」をクリックしてください。

    ![HZdBb4d4QoLEUzxrkxpcqro4nTe](/img/HZdBb4d4QoLEUzxrkxpcqro4nTe.png)

### ステップ2:セキュリティグループを作成する{#step-2-create-a-security-group}

VPC内のセキュリティグループは、EC 2インスタンスの仮想ファイアウォールとして機能し、インバウンドおよびアウトバウンドトラフィックを制御することで、AWSリソースを保護します。セキュリティグループは以下のように作成できます:

1. AWSのVPCダッシュボードに移動してください。

1. 左のナビゲーションペインで「セキュリティ」>「セキュリティグループ」を探し、右のペインの右上隅にある「セキュリティグループの作成」をクリックしてください。

1. **セキュリティグループ名**と**説明**を設定し、VPCドロップダウンリストから以前に作成したVPCを選択してください。

    ![W6n9b4BRVoVi8PxgrLUcajOtnSc](/img/W6n9b4BRVoVi8PxgrLUcajOtnSc.png)

1. 「インバウンドルール」セクションで「ルールの追加」をクリックして、インバウンドルールを作成してください。

1. 「ソース」で「Anywhere-IPv 4」を選択するか、「ソース」ドロップダウンの右側のテキストボックスにアクセスを許可するCIDRブロックを入力してください。

    ![Z6SObL7FYofXBuxk46WcuRsbnLb](/img/Z6SObL7FYofXBuxk46WcuRsbnLb.png)

1. レコードを追加し、TypeでHTTPSを選択し、DestinationでAnywhere-IPv 4を選択するか、Destinationドロップダウンの右側のテキストボックスにアクセスが許可されているCIDRブロックを入力してください。

    ![N0B8bIiXdobTjUxp1AVc76Xcnsc](/img/N0B8bIiXdobTjUxp1AVc76Xcnsc.png)

1. 以下のスクリーンショットに示すように、**タグ**セクションにキーと値のペアを追加してください。

    ![FlaPbHes2oLjZ8xO1X9cppYTnyc](/img/FlaPbHes2oLjZ8xO1X9cppYTnyc.png)

1. セキュリティグループを保存するには、**セキュリティグループの作成**をクリックしてください。

1. セキュリティグループIDをZilliz Cloudにコピーしてください。

    ![KMuWbhLTVoiyCjx1HXjcGERunZd](/img/KMuWbhLTVoiyCjx1HXjcGERunZd.png)

### ステップ3:（オプション）VPCエンドポイントを作成する{#step-3-optional-create-a-vpc-endpoint}

VPCエンドポイントは、安全なクラスター接続リレーを確保し、Zilliz Cloud REST APIへのプライベートコールを可能にします。AWSマネジメントコンソールでVPCエンドポイントを管理する方法については、AWSマネジメントコンソールの[AWSの記事でVPCエンドポイントを作成する](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html)を参照するか、以下の手順を使用してください

<Admonition type="info" icon="📘" title="ノート">

<p>このセクションで作成されたVPCエンドポイントは、AWS PrivateLinkを設定するために使用されます。VPCエンドポイントが準備できたら、ホストゾーンを作成し、いくつかのDNSレコードを追加する必要があります。詳細については、<a href="./setup-a-private-link-aws">PrivateLink(AWS)を設定する</a>を参照してください。</p>

</Admonition>

1. AWSの**VPCダッシュボード**に移動してください。

1. 左のナビゲーションペインで**PrivateLink and Lattice**>**Endpoints**を見つけ、右のペインの右上隅にある**Create endpoint**をクリックしてください。

1. **名前タグ**を設定するか、空白のままにしてAWSに生成させます。**タイプ**については、**NLBとGWLBを使用するエンドポイントサービス**を選択してください。

    ![GRIrbg4sYoN75oxCnRsci3JnnLO](/img/GRIrbg4sYoN75oxCnRsci3JnnLO.png)

1. **サービス設定**で、**サービス名**に地域のZilliz Cloud VPCエンドポイントを入力し、**サービスの検証**をクリックしてください。 

    以下の表に現在利用可能なクラウドリージョンが記載されています。もし表に記載されていない場合は、support@zilliz.comまでお問い合わせください。

    <table>
       <tr>
         <th><p>AWSリージョン</p></th>
         <th><p>ロケーション</p></th>
         <th><p>Zilliz Cloud VPCエンドポイント</p></th>
       </tr>
       <tr>
         <td><p>us-west-2ファイル</p></td>
         <td><p>オレゴン州</p></td>
         <td><p>インラインコードプレースホルダー0</p></td>
       </tr>
       <tr>
         <td><p>eu-central-1ダウンロード</p></td>
         <td><p>フランクフルト</p></td>
         <td><p>インラインコードプレースホルダー0</p></td>
       </tr>
    </table>

    ![VYLlboU8fofvUPx6NYUcGztpn3s](/img/VYLlboU8fofvUPx6NYUcGztpn3s.png)

1. ネットワーク設定で、[上記で作成したVPC](./configure-vpc#step-1-create-vpc-and-resources)を選択し、**DNS名を有効にする**を選択してください。

    ![DyH3b9kOro2wf6xGcsUcD2DbnVo](/img/DyH3b9kOro2wf6xGcsUcD2DbnVo.png)

1. **Subnet**で、[VPCと一緒に作成されたプライベートサブネット](./configure-vpc#step-1-create-vpc-and-resources)を選択してください。 

    ![IdcebwU1Ao4QffxGwYTceh9AnVe](/img/IdcebwU1Ao4QffxGwYTceh9AnVe.png)

1. **セキュリティグループ**で、[上記で作成されたセキュリティグループ](./configure-vpc#step-2-create-a-security-group)を選択してください。

1. 上記の設定を保存するには、**エンドポイントの作成**をクリックしてください。

1. VPCエンドポイントIDをZilliz Cloudにコピーしてください。

    ![B8LebFyuPofym4xT0S9c1fMMnDg](/img/B8LebFyuPofym4xT0S9c1fMMnDg.png)

### ステップ4:（オプション）DNSレコードを設定する{#step-4-optional-set-up-a-dns-record}

オプションで、VPCとZilliz BYOCの間にプライベートリンクを設定して、トラフィックを暗号化することができます。そのためには、ホストゾーンを作成し、VPCに関連付け、ホストゾーンにCNAMEレコードを作成して、Zilliz BYOCドメイン名をVPCエンドポイントに解決する必要があります。 

1. Amazon Route 53を使用してホストゾーンを作成します。

    Amazon Route 53はWebベースのDNSサービスです。DNSレコードを追加できるように、ホストされたDNSゾーンを作成してください。

    ![CtSAbhMSFoiR2hx8QIGcQbYFnbd](/img/CtSAbhMSFoiR2hx8QIGcQbYFnbd.png)

    1. AWSアカウントにログインし、[ホストゾーン](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#)に移動してください。

    1. 「ホストゾーンの作成」をクリックしてください。

    1. 「ホストゾーンの構成」セクションで、以下のパラメータを設定してください。

        <table>
           <tr>
             <th><p>パラメータ名</p></th>
             <th><p>パラメータの説明</p></th>
           </tr>
           <tr>
             <td><p><strong>ドメイン名</strong></p></td>
             <td><p><code>byoc.zillizcloud.com</code>を使用してください。</p></td>
           </tr>
           <tr>
             <td><p><strong>の説明</strong></p></td>
             <td><p>ホストゾーンを区別するために使用される説明。</p></td>
           </tr>
           <tr>
             <td><p><strong>タイプ</strong></p></td>
             <td><p>「プライベートホストゾーン」を選択してください。</p></td>
           </tr>
        </table>

    1. [ホストゾーンに関連付けるVPC]セクションで、ホストゾーンに関連付けるVPC IDを追加します。

1. ホストゾーンにCNAMEレコードを作成します。

    CNAMEレコードは、エイリアス名を真のまたは正規のドメイン名にマップするDNSレコードの一種です。Zilliz Cloudによって割り当てられたプライベートリンクをVPCエンドポイントのDNS名にマップするエイリアスレコードを作成します。その後、プライベートリンクを使用してクラスターにプライベートにアクセスできます。

    ![LjLubo12Wo2Pyhx3jLUc1nH1nRh](/img/LjLubo12Wo2Pyhx3jLUc1nH1nRh.png)

    1. 作成したホストゾーンで、**レコードの作成**をクリックします。

    1. 現在のプロジェクトが展開されているクラウドリージョンに合わせて、**レコード名**を設定してください。

        <table>
           <tr>
             <th><p>AWSリージョン</p></th>
             <th><p>レコード名</p></th>
           </tr>
           <tr>
             <td><p>us-west-2ファイル</p></td>
             <td><p>インラインコードプレースホルダー0</p></td>
           </tr>
           <tr>
             <td><p>eu-central-1ダウンロード</p></td>
             <td><p>インラインコードプレースホルダー0</p></td>
           </tr>
        </table>

    1. 「レコードの作成」ページで、「エイリアス」をオンにし、「トラフィックを以下のようにルーティングする」を選択してください

        1. 最初のドロップダウンリストで**VPCエンドポイントへのエイリアス**を選択してください。

        1. 2番目のドロップダウンリストで雲の地域を選択してください。

        1. 上で作成したエンドポイントの名前を入力します。

    1. 「レコードの作成」をクリックしてください。

### ステップ5: VPC情報をZilliz Cloudに提出する{#step-5-submit-vpc-information-to-zilliz-cloud}

上記の手順をAWSで完了したら、Zilliz Cloudに戻り、**ネットワーク設定**にVPC ID、サブネットID、セキュリティグループID、オプションのVPCエンドポイントIDを入力し、**次へ**をクリックしてプロジェクト展開過程全体の概要を表示します。すべてが予想通りに構成されている場合は、**展開**をクリックして過程を開始してください。

![VDXYbAfS2oQ04YxcMs0cEETbn2c](/img/VDXYbAfS2oQ04YxcMs0cEETbn2c.png)

