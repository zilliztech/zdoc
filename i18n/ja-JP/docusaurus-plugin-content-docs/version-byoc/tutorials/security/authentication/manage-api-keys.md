---
title: "APIキー | BYOC"
slug: /manage-api-keys
sidebar_label: "APIキー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "APIキーは、Zilliz CloudコントロールプレーンおよびデータプレーンリソースにアクセスするためのAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前やIDなどの独自のプロパティを持つ英数字の文字列です。 | BYOC"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスターコンテナ
  - APIキー
  - ベクトル次元
  - ANN検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル

---

import Admonition from '@theme/Admonition';


# APIキー

APIキーは、Zilliz CloudコントロールプレーンおよびデータプレーンリソースにアクセスするためのAPIまたはSDK呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。APIキーは、名前やIDなどの独自のプロパティを持つ英数字の文字列です。

## APIキーの概要\{#overview-of-api-keys}

Zilliz Cloudは、多様なユーザー要件に対応するために2種類のAPIキーを提供します：

- **パーソナルAPIキー**：ユーザー登録時に自動生成され、各キーはユーザーのアカウントにリンクし、ユーザーが所属する組織およびプロジェクト内のユーザーのロールの権限を継承します。アカウントユーザーが組織を離れる場合、関連するパーソナルキーは自動的に削除されます。[組織オーナー](./organization-users#organization-roles)または[プロジェクト管理者](./project-users#project-roles)として、Zilliz Cloudウェブコンソールで2種類のパーソナルAPIキーを確認できます：

    - **自分のパーソナルAPIキー**：自分専用のパーソナルキー。このAPIキーを表示およびコピーできます。

    - **メンバーのパーソナルAPIキー**：組織またはプロジェクト内の他のユーザーに属する既存のパーソナルキーのリスト。これらのキーの名前とIDのみを表示できますが、キー自体は表示できません。

- **カスタマイズAPIキー**：Zilliz Cloudアカウントを持たないアプリケーションまたは外部ユーザーのために、**組織オーナー**および**プロジェクト管理者**が手動で作成します。これらのキーは、APIキーの作成者が組織を離れてもサービスの継続性を確保する長期的なアクセスニーズに最適です。

以下の図は、APIキーのロールとリソースアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](/img/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

以下の表は、割り当てられたロールに基づくAPIキーのアクセス範囲の詳細を示します。ロールと権限の詳細については、[アクセス制御](./access-control)を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>APIキーのロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>組織オーナー</p></td>
     <td><p>プロジェクトおよびクラスターを含む、組織内のすべてのリソースへの完全管理者アクセス。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>組織請求管理者</p></td>
     <td><p>組織請求への管理者アクセスのみ。組織内のプロジェクトおよびクラスターへのアクセスはありません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>組織メンバー</p></td>
     <td><p>プロジェクト管理者</p></td>
     <td><p>指定されたプロジェクトへの完全管理者アクセス、およびプロジェクト内のすべてのクラスターへの完全管理者アクセスがデフォルトで付与されます。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読込・書込</p></td>
     <td><p>指定されたプロジェクトへの読み書きアクセス、およびプロジェクト内のすべてのクラスターへの読み書きアクセスがデフォルトで付与されます。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト読取専用</p></td>
     <td><p>指定されたプロジェクトへの読み取り専用アクセス、およびプロジェクト内のすべてのクラスターへの読み取り専用アクセスがデフォルトで付与されます。</p></td>
   </tr>
</table>

### 制限と制約\{#limits-and-restrictions}

- 各組織は最大100個のカスタマイズAPIキーを保持できます。

- APIキーの管理権限は、ユーザーの組織およびプロジェクト内のロールに影響されます。特定の権限は以下のように概要されます：

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>組織オーナー</strong></p></th>
         <th rowspan="2"><p><strong>組織請求管理者</strong></p></th>
         <th colspan="3"><p><strong>組織メンバー</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>プロジェクト管理者</strong></p></td>
         <td><p><strong>プロジェクト読込・書込</strong></p></td>
         <td><p><strong>プロジェクト読取専用</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>自分のパーソナルAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>表示およびコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
         <td><p>✔️</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>ユーザーが組織を離れる際に自動削除</p></td>
         <td><p>ユーザーが組織を離れる際に自動削除</p></td>
         <td><p>ユーザーが組織を離れる際に自動削除</p></td>
         <td><p>ユーザーが組織を離れる際に自動削除</p></td>
         <td><p>ユーザーが組織を離れる際に自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーのパーソナルAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
         <td><p>自動生成</p></td>
       </tr>
       <tr>
         <td><p>名前とIDを表示</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>コピー</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>メンバーが組織を離れる際に自動削除</p></td>
         <td><p>メンバーが組織を離れる際に自動削除</p></td>
         <td><p>メンバーが組織を離れる際に自動削除</p></td>
         <td><p>メンバーが組織を離れる際に自動削除</p></td>
         <td><p>メンバーが組織を離れる際に自動削除</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>カスタマイズAPIキー</strong></p></td>
       </tr>
       <tr>
         <td><p>作成</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>表示およびコピー</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>編集</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>リセット</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
       <tr>
         <td><p>削除</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✔️</p></td>
         <td><p>✘</p></td>
         <td><p>✘</p></td>
       </tr>
    </table>

## APIキーの作成\{#create-an-api-key}

組織ユーザーごとにZilliz Cloudが自動生成するパーソナルキーに加えて、カスタマイズキーを作成できます。**組織オーナー**および**プロジェクト管理者**のみがカスタマイズAPIキーを作成できます。

1. 組織の**APIキー**ページに移動します。**+ APIキー**をクリックします。

    ![create-api-key](/img/create-api-key.png)

1. **APIキー名**を入力し、**APIキーのアクセス**を構成します。

    ![BSdPbaXHdoIPp0xBsA0chg0onfL](/img/BSdPbaXHdoIPp0xBsA0chg0onfL.png)

    - **APIキー名**：名前は64文字を超えてはいけません。

    - **APIキーのアクセス**：適切な組織およびプロジェクトロールを割り当てることで、現在のカスタマイズAPIキーのアクセス範囲を定義します。よりきめ細かなアクセス制御のために、**特定のクラスターへのアクセスを制限**をチェックしてキーがアクセスできるクラスターを制限できます。

        <Admonition type="info" icon="📘" title="注意">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限範囲に限定されます。</p>

        </Admonition>

## APIキーの表示\{#view-api-keys}

組織の**APIキー**ページに移動します。表示は特定の[ロール](./manage-api-keys#limits-and-restrictions)によって異なる場合があります。

- **組織オーナー**として、自分のパーソナルキー、すべてのメンバーのパーソナルキー、およびすべてのカスタマイズキーを表示できます。

- **プロジェクト管理者**として、自分のパーソナルキー、権限範囲内のメンバーのパーソナルキーおよびカスタマイズキーを表示できます。たとえば、*ユーザー1*が*プロジェクトA*のプロジェクト管理者のみである場合、*プロジェクトA*、*B*、*C*への管理者アクセスを持つ*キー1*は、*ユーザー1*のアクセス範囲を超えるため*ユーザー1*には表示されません。

- **組織請求管理者**、**プロジェクト読込・書込**、または**プロジェクト読取専用**として、自分のパーソナルAPIキーのみ表示できます。

以下のスクリーンショットは、**組織オーナー**のAPIキー表示を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](/img/KKONbcCa3o4qr9xJlhlcQMwinRd.png)

## APIキーの編集\{#edit-an-api-key}

現在、カスタマイズAPIキーのみを編集できます。パーソナルキーはアカウントユーザーに紐付けられているため編集できません。パーソナルキーのアクセス範囲を変更するには、まずユーザーの組織およびプロジェクトロールを調整する必要があります。ユーザーのロールに加えられた変更は、自動的にキーのアクセス権限に反映されます。

以下の手順は、カスタマイズAPIキーの編集方法を説明しています。

1. 組織の**APIキー**ページに移動します。アクション列の**...**をクリックし、**編集**をクリックします。

    ![edit-api-key](/img/edit-api-key.png)

1. APIキーの**APIキー名**および**APIキーのアクセス**を編集します。

    ![YqNtbRsyroP2cGxGLObcQgb7njh](/img/YqNtbRsyroP2cGxGLObcQgb7njh.png)

    - **APIキー名**：名前は64文字を超えてはいけません。

    - **APIキーのアクセス**：適切な組織およびプロジェクトロールを割り当てることで、現在のカスタマイズAPIキーのアクセス範囲を定義します。よりきめ細かなアクセス制御のために、**特定のクラスターへのアクセスを制限**をチェックしてキーがアクセスできるクラスターを制限できます。

        <Admonition type="info" icon="📘" title="注意">

        <p><a href="./project-users">プロジェクト管理者</a>の場合、このユーザーがAPIキーに付与できる権限は、ユーザー自身の権限範囲に限定されます。</p>

        </Admonition>

## APIキーのリセット\{#reset-an-api-key}

パーソナルまたはカスタマイズAPIキーが漏洩したと考えられる場合は、すぐにリセットする必要があります。

<Admonition type="caution" icon="🚧" title="警告">

<p>この操作は現在のAPIキーをリセットして無効にします。このキーを使用しているアプリケーションコードは、関連するコードを新しいキー値で更新するまで機能を停止します。</p>

</Admonition>

キーの種類に応じて、手順は異なります：

- **パーソナルAPIキーのリセット**：ロールに関係なく、自分のパーソナルAPIキーのみリセットできます。

    ![reset-personal-api-keys](/img/reset-personal-api-keys.png)

- **カスタマイズAPIキーのリセット**：組織オーナーおよびプロジェクト管理者のみがカスタマイズAPIキーをリセットできます。

    ![reset-customized-api-keys](/img/reset-customized-api-keys.png)

## APIキーの削除\{#delete-an-api-key}

カスタマイズAPIキーが使用されなくなった場合は、できるだけ早く削除する必要があります。**組織オーナー**および**プロジェクト管理者**のみがカスタマイズAPIキーを削除できます。

パーソナルキーは手動で削除できませんが、対応するユーザーが組織を離れると自動的に無効化されて削除されます。

以下のスクリーンショットは、カスタマイズAPIキーの削除方法を示しています。

<Admonition type="caution" icon="🚧" title="警告">

<p>APIキーを削除すると、そのキーを使用するサービスによるZilliz Cloudリソースへのアクセスが不可逆的に終了します。</p>

</Admonition>

![delete-customized-api-keys](/img/delete-customized-api-keys.png)