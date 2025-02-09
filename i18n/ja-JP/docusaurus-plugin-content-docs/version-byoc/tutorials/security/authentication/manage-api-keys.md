---
title: "APIキー | BYOC"
slug: /manage-api-keys
sidebar_label: "APIキー"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、すべての組織にAPIキーのセットが付属しています。これらのキーは、RESTful APIまたはSDKの呼び出しを開始するために必要な必須の認証トークンです。組織内の特定のプロジェクトやリソースにアクセスする際に重要な役割を果たします。 | BYOC"
type: origin
token: V9nuw98wtiAwPkkmNRocftgknye
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - api key
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';


# APIキー

Zilliz Cloudでは、すべての組織にAPIキーのセットが付属しています。これらのキーは、RESTful APIまたはSDKの呼び出しを開始するために必要な必須の認証トークンです。組織内の特定のプロジェクトやリソースにアクセスする際に重要な役割を果たします。

## APIキーの概要{#overview-of-api-keys}

さまざまな要件に対応するため、Zilliz Cloudは2種類の異なるAPIキーを提供しています。

- **個人キー**:個々のユーザーにリンクされたこのタイプのキーは、Zilliz Cloudによって各組織のユーザーごとに自動生成され、ユーザーロールの権限を継承します。ユーザーが組織を離れると、その個人キーは自動的に削除されるため、長期的なプロジェクトには適していない場合があります。

- **カスタマイズキー**:個々のユーザーではなく、アプリケーションやプログラムに関連付けられています。[所有者](./organization-users#organization-roles)または[管理者](./project-users#project-roles)ステータスを持つユーザーは、組織ごとに最大100個のカスタムAPIキーを使用して、このタイプのキーを作成および監視できます。カスタマイズキーは開発目的に適しており、安定した長期的なAPI統合および自動化機能を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>2024年1月16日以前にリリースされたバージョンでは、APIキータイプは分類されていませんでした。この日以前にリリースされたバージョンからZilliz Cloudサービスをアップグレードする場合、以前に生成されたAPIキーはカスタマイズされたAPIキーとして指定されます。これらのキーは、元のAPIキーのプロジェクトレベルの権限を継承します。</p>

</Admonition>

### RBACを使用した安全なAPI呼び出しを実現{#secure-api-calls-with-rbac}

ロールベースアクセス制御(RBAC)は、API呼び出しの管理に適用されるZilliz Cloudの重要なセキュリティメカニズムです。このシステムにより、組織内のユーザーに特定の権限を持つロールを割り当てることで、リソースへのアクセスを細かく制御できます。

各ロールのアクセスレベルの詳細については、[ネットワークとセキュリティ](./network-and-security)を参照してください。

![api-key-access](/byoc/ja-JP/api-key-access.png)

### APIキーの管理{#api-key-management}

組織内のユーザーロールは、APIキー管理権限の範囲に影響します。具体的な権限は以下の通りです。

<table>
   <tr>
     <th></th>
     <th><p>組織オーナー</p></th>
     <th><p>プロジェクト管理者</p></th>
     <th><p>プロジェクトの読み書き</p></th>
     <th><p>読み取り専用プロジェクト</p></th>
   </tr>
   <tr>
     <td colspan="5"><p><strong>パーソナルAPIキー</strong></p></td>
   </tr>
   <tr>
     <td><p>クリエーション</p></td>
     <td><p>自動生成された</p></td>
     <td><p>自動生成された</p></td>
     <td><p>自動生成された</p></td>
     <td><p>自動生成された</p></td>
   </tr>
   <tr>
     <td><p>ユーザーに割り当てられたAPIキーの表示</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>メンバーのAPIキー名を表示する[1]</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>リセットAPIキー[2]</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td colspan="5"><p><strong>カスタマイズされたAPIキー</strong></p></td>
   </tr>
   <tr>
     <td><p>クリエーション</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️ [3]</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>閲覧する</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️ [4]</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>アクセス許可をAPIキーから削除する</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️ [4]</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>APIキー名の編集</p></td>
     <td><p>✔️</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>APIキーのリセット</p></td>
     <td><p>✔️</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>APIキーの削除</p></td>
     <td><p>✔️</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
</table>

メモ:

[1][オーナー](./organization-users#organization-roles)または[管理者](./project-users#project-roles)のユーザーは、権限範囲に基づいてメンバーのAPIキー名を閲覧できます。Organizationのオーナーは、Organization全体のメンバーのAPIキー名を閲覧できますが、プロジェクト管理者は自分の権限範囲内のキーのみを閲覧できます。プロジェクトの読み書きまたは読み取り専用は、自分の個人キーのみを閲覧できます。

[2]各ユーザーは自分の個人キーのみをリセットできます。

[3]プロジェクト管理者がカスタマイズされたAPIキーに付与できるパーミッションは、プロジェクト管理者自身のパーミッションスコープの対象となります。

[4]プロジェクト管理者は、権限範囲内でのみカスタマイズされたAPIキーを表示または管理できます。たとえば、**ユーザー1**が**プロジェクトA**を所有し、カスタマイズされたAPIキー(**Key 1**)が**プロジェクトA**、**B**、および**C**にアクセスできる場合、**ユーザー1**はアクセス範囲が**Key 1**の権限を超えるため、**Key 1**にアクセスできません。

## 作成するAPIキー{#create-an-api-key}

Zilliz Cloudが組織のユーザーごとに自動的に生成する個人キー以外にも、カスタマイズされたキーを作成することができます。長期プロジェクトやアプリケーション開発の場合は、個人キーではなく[カスタマイズされたAPIキー](./manage-api-keys)を使用することをお勧めします。

各[Organizationオーナー](./organization-users#organization-roles)または[プロジェクト管理者](./project-users#project-roles)は、カスタマイズされた APIキーを作成する権限を持っています。APIキーを作成するための重要なステップは、アクセス範囲を定義することです。ここで、APIキーがアクセス可能なプロジェクトやクラスタを決定します。

- **APIキーアクセス**:現在のカスタマイズされたAPIキーのアクセススコープを定義するには、適切な組織の役割を割り当て、ターゲットプロジェクトにキーをアクセス可能に指定し、そのプロジェクト内でキーの役割を設定します。より細かいアクセス制御を行うには、**Restrict Access to Specific Clusters**でホワイトリストを設定して、キーがアクセス可能なクラスターを制限できます。

プロジェクトは**API Key Access**で追加できます。

<Admonition type="info" icon="📘" title="ノート">

<p>カスタマイズされたAPIキーを作成する<a href="./project-users#project-roles">プロジェクト管理者</a>の場合、付与できる権限は自分の権限範囲に限定されます。これにより、各APIキーの機能が作成者の責任と役割に合わせて調整され、安全で制御された環境が維持されます。</p>

</Admonition>

![create-customized-api-key](/byoc/ja-JP/create-customized-api-key.png)

カスタマイズされたAPIキーを使用して、APIキーがアクセスできるクラスタへの接続を確立できます。詳細については、[Clusterに接続](./connect-to-cluster)を参照してください。

## APIキーを見る{#view-api-keys}

Organizationで作成されたAPIキーを表示するには、[Organization Owner](./organization-users#organization-roles)または[Project Admin](./project-users#project-roles)の役割を持っている必要があります。

- **個人キー**:Organizationオーナーまたはプロジェクト管理者は、Organization内のユーザーのために生成されたメンバーのAPIキーの名前を見る特権を持っています。ただし、これらの個人APIキーの実際の値にはアクセスできないため、ユーザーのプライバシーとセキュリティが確保されます。

- **カスタマイズされたキー**:[Organization Owners](./organization-users#organization-roles)Organization内で作成されたすべてのカスタマイズされたAPIキーを閲覧可能です。[プロジェクト管理者](./project-users#project-roles)の場合、アクセス範囲が自分自身の範囲内にあるAPIキーのみ閲覧可能です。つまり、プロジェクトに関連し、管理者がアクセスできるAPIキーのみにアクセスできます。

![view-api-keys](/byoc/ja-JP/view-api-keys.png)

## APIキーの編集{#edit-an-api-key}

Organization[オーナー](./organization-users#organization-roles)または[プロジェクト管理者](./project-users#project-roles)は、APIキーを編集して名前を変更したり、アクセス権限を変更したりできます。

- **カスタマイズキーの名前変更**:[Organizationオーナー](./organization-users#organization-roles)のみが、カスタマイズAPIキーの名前を変更できます。

- **アクセス権限の変更**:[Organization Owner](./organization-users#organization-roles)として、APIキーの権限を任意の容量で更新する権限があります。[プロジェクト管理者](./project-users#project-roles)の場合、APIキーの権限を変更する権限は、すでに保持している権限の範囲に制限されます。つまり、[プロジェクト管理者](./project-users#project-roles)として、現在のアクセス権限よりも高いレベルに権限を拡張することはできず、権限の昇格が発生しないようにします。

<Admonition type="info" icon="📘" title="ノート">

<p>カスタマイズされたAPIキーのみが編集できます。</p>

</Admonition>

![edit-api-key](/byoc/ja-JP/edit-api-key.png)

## APIキーをリセットする{#reset-an-api-key}

アクセス制御のセキュリティと整合性を維持するために、APIキーをリセットすることは非常に重要です。キーの種類によって、その過程は異なります。

- **個人キー**:各組織のユーザーは、役割に関係なく、自分の個人APIキーのみをリセットできます。これにより、ユーザーは新しいキーを生成してセキュリティ上の懸念やアクセスの問題に迅速に対応し、安全でパーソナライズされたアクセスシステムを維持できます。

- **カスタマイズされたキー**:カスタマイズされたAPIキーのリセットは、[組織所有者](./organization-users#organization-roles)専用です。このレベルの制御は、より広範な組織全体のアクセスとセキュリティを管理する上で重要です。[組織所有者](./organization-users#organization-roles)は、これらのキーをリセットしてセキュリティ問題に対処したり、アクセスプロトコルを更新したりして、アプリケーションレベルのアクセスの整合性が損なわれないようにすることができます。

<Admonition type="caution" icon="🚧" title="警告">

<p>この操作により、現在のAPIキーがリセットおよび無効化されます。このキーを使用するカスタムコードは、関連するコードを新しいキーで更新するまで機能しなくなります。</p>

</Admonition>

![reset-api-key](/byoc/ja-JP/reset-api-key.png)

## APIキーの削除{#delete-an-api-key}

不要になったAPIキーは、[Organization Owner](./organization-users#organization-roles)として削除できます。

カスタマイズされたAPIキーのみ削除できます。個人キーは自分のユーザーによってリセットできますが、削除することはできません。

<Admonition type="caution" icon="🚧" title="警告">

<p>APIキーを削除する場合は注意してください。削除すると、そのキーを使用していたリソースへのアクセスがすぐに取り消されます。</p>

</Admonition>

![delete-api-key](/byoc/ja-JP/delete-api-key.png)

## 関連するトピック{#related-topics}

- [Clusterに接続](./connect-to-cluster)

- [クラスタの認証情報(コンソール)](./cluster-credentials-sdk)

- [クラスタ資格情報(SDK)](./cluster-credentials-console)

