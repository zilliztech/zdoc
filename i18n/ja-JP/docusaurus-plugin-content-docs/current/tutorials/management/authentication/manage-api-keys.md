---
title: "API キー | Cloud"
slug: /manage-api-keys
sidebar_label: "API キー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "API キーは、Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするために API 呼び出しや SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。API キーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。 | Cloud"
type: origin
token: BRsZwqOUTiBbrPk9b5WcvFgTnze
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# API キー

API キーは、Zilliz Cloud のコントロールプレーンおよびデータプレーンのリソースにアクセスするために API 呼び出しや SDK 呼び出しを行うユーザーまたはアプリケーションを認証するために使用されます。API キーは、名前や ID などの独自のプロパティを持つ英数字の文字列です。

## API キーの概要\{#overview-of-api-keys}

Zilliz Cloud では、多様なユーザーの要件に応えるために 2 種類の API キーを提供しています。

- **パーソナル API キー**：ユーザー登録時に自動的に生成され、各キーはユーザーのアカウントにリンクされて、ユーザーが所属する組織およびプロジェクト内でのユーザーのロールの権限を継承します。アカウントユーザーが組織を離れた場合、関連付けられたパーソナルキーは自動的に削除されます。[Organization Owner](./manage-platform-roles#predefined-organization-roles) または [Project Admin](./manage-platform-roles#predefined-project-roles) として、Zilliz Cloud Web コンソールで 2 種類のパーソナル API キーを確認できます。

    - **自分のパーソナル API キー**：自分だけに属するパーソナルキーです。この API キーを表示およびコピーできます。

    - **メンバーのパーソナル API キー**：組織またはプロジェクト内の他のユーザーに属する既存のパーソナルキーの一覧です。これらのキーの名前と ID は表示できますが、キー自体は表示できません。

- **カスタマイズされた API キー**：Zilliz Cloud アカウントを持たないアプリケーションまたは外部ユーザー向けに、**Organization Owners** および **Project Admins** が手動で作成します。これらのキーは長期的なアクセス要件に最適で、API キーの最初の作成者が組織を離れた場合でもサービスの継続性を保証します。

<Admonition type="info" title="Notes">

本番環境では、代わりにカスタマイズされたキーを使用してください。パーソナル API キーは、ユーザーアカウントとともに削除されます。

</Admonition>

次の図は、API キーのロールとリソースアクセスを示しています。

![Ec7wwrAnFhGIZFbJTWwc57bVn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/Ec7wwrAnFhGIZFbJTWwc57bVn0f.png)

次の表では、割り当てられたロールに基づく API キーのアクセススコープについて詳しく説明します。ロールと権限の詳細については、アクセス制御の解説を参照してください。

<table>
   <tr>
     <th colspan="2"><p><strong>API キーのロール</strong></p></th>
     <th><p><strong>アクセスレベル</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Owner</p></td>
     <td><p>組織内のすべてのリソース（プロジェクト、クラスター、ボリュームなど）に対する完全な管理者アクセスです。</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Organization Billing Admin</p></td>
     <td><p>組織の請求のみに対する管理者アクセスです。組織内のプロジェクト、クラスター、ボリュームにはアクセスできません。</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Organization Member</p></td>
     <td><p>Project Admin</p></td>
     <td><p>指定されたプロジェクトに対する完全な管理者アクセスと、デフォルトでそのプロジェクト内のすべてのクラスターおよびボリュームに対する完全な管理者アクセスです。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Write</p></td>
     <td><p>指定されたプロジェクトへの読み取りおよび書き込みアクセスと、デフォルトでそのプロジェクト内のすべてのクラスターおよびボリュームへの読み取りおよび書き込みアクセスです。</p></td>
   </tr>
   <tr>
     <td><p>Project Read-Only</p></td>
     <td><p>指定されたプロジェクトへの読み取り専用アクセスと、デフォルトでそのプロジェクト内のすべてのクラスターおよびボリュームへの読み取り専用アクセスです。</p></td>
   </tr>
</table>

### 制限と制約\{#limits-and-restrictions}

- 各組織には最大 100 個のカスタマイズされた API キーを含めることができます。

- API キーの管理権限は、組織およびプロジェクト内でのユーザーのロールによって異なります。具体的な権限は次のとおりです。

    <table>
       <tr>
         <th rowspan="2"></th>
         <th rowspan="2"><p><strong>Organization Owner</strong></p></th>
         <th rowspan="2"><p><strong>Organization Billing Admin</strong></p></th>
         <th colspan="3"><p><strong>Organization Member</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Project Admin</strong></p></td>
         <td><p><strong>Project Read-Write</strong></p></td>
         <td><p><strong>Project Read-Only</strong></p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>自分のパーソナル API キー</strong></p></td>
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
         <td><p>表示とコピー</p></td>
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
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
         <td><p>ユーザーが組織を離れると自動的に削除されます</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>メンバーのパーソナル API キー</strong></p></td>
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
         <td><p>名前と ID を表示</p></td>
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
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
         <td><p>メンバーが組織を離れると自動的に削除されます</p></td>
       </tr>
       <tr>
         <td colspan="6"><p><strong>カスタマイズされた API キー</strong></p></td>
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
         <td><p>表示とコピー</p></td>
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

## API キーを作成する\{#create-an-api-key}

Zilliz Cloud が各組織ユーザーに対して自動的に生成するパーソナルキーとは別に、カスタマイズされたキーを作成できます。カスタマイズされた API キーを作成できるのは、**Organization Owners** と **Project Admins** のみです。

<Procedures>

1. 組織の **API Keys** ページに移動します。**+ API Key** をクリックします。

    ![create-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/create-api-key.png "create-api-key")

1. **API Key Name** を入力し、**API Key Access** を構成します。

    ![Td6mboU99oiRhVxvbYecZJf1nGC](https://zdoc-images.s3.us-west-2.amazonaws.com/td6mbou99oirhvxvbyeczjf1ngc.png "Td6mboU99oiRhVxvbYecZJf1nGC")

    - **API Key Name：**名前は 64 文字以内にする必要があります。

    - **API Key Description（任意）**：作成する API キーの説明です。最大 255 文字です。

    - **API Key Access**：適切な組織ロールおよびプロジェクトロールを割り当てて、現在のカスタマイズされた API キーのアクセススコープを定義します。より詳細なアクセス制御を行うには、**Restrict Access to Specific クラスター and Volumes** をオンにして、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" title="Notes">

        [Project Admins](./manage-platform-roles#predefined-project-roles) の場合、このユーザーが API キーに付与できる権限は、ユーザー自身の権限スコープに限定されます。 

        </Admonition>

</Procedures>

## API キーを表示する\{#view-api-keys}

組織の **API Keys** ページに移動します。表示内容は、[ロール](./manage-api-keys#limits-and-restrictions) によって異なる場合があります。

- **Organization Owner** の場合は、自分のパーソナルキー、すべてのメンバーのパーソナルキー、およびすべてのカスタマイズされたキーを表示できます。 

- **Project Admin** の場合は、自分のパーソナルキー、メンバーのパーソナルキー、および権限スコープ内にあるカスタマイズされたキーを表示できます。たとえば、*User 1* が *Project A* の Project Admin のみであり、*Key 1* が *Projects A*、*B*、*C* への管理者アクセスを持っている場合、*Key 1* のアクセススコープは *User 1* の権限を超えているため、*Key 1* は *User 1* には表示されません。

- **Organization Billing Admin**、**Project Read-Write**、または **Project Read-Only** の場合は、自分のパーソナル API キーのみを表示できます。

次のスクリーンショットは、**Organization Owner** の API キー表示を示しています。

![KKONbcCa3o4qr9xJlhlcQMwinRd](https://zdoc-images.s3.us-west-2.amazonaws.com/kkonbcca3o4qr9xjlhlcqmwinrd.png "KKONbcCa3o4qr9xJlhlcQMwinRd")

## API キーを編集する\{#edit-an-api-key}

現在、編集できるのはカスタマイズされた API キーのみです。パーソナルキーはアカウントユーザーに紐付けられているため、編集できません。パーソナルキーのアクセススコープを変更するには、まずユーザーの組織ロールおよびプロジェクトロールを調整する必要があります。ユーザーのロールへの変更は、キーのアクセス権限に自動的に反映されます。

以下の手順では、カスタマイズされた API キーを編集する方法について説明します。

<Procedures>

1. 組織の **API Keys** ページに移動します。操作列の **...** をクリックし、**Edit** をクリックします。

    ![edit-api-key](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-api-key.png "edit-api-key")

1. API キーの **API Key Name** と **API Key Access** を編集します。

    ![JXeubHidbokaTax90eZcrmA9nIg](https://zdoc-images.s3.us-west-2.amazonaws.com/jxeubhidbokatax90ezcrma9nig.png "JXeubHidbokaTax90eZcrmA9nIg")

    - **API Key Name：**名前は 64 文字以内にする必要があります。

    - **API Key Access**：適切な組織ロールおよびプロジェクトロールを割り当てて、現在のカスタマイズされた API キーのアクセススコープを定義します。より詳細なアクセス制御を行うには、**Restrict Access to Specific クラスター and Volumes** をオンにして、キーがアクセスできるクラスターとボリュームを制限できます。

        <Admonition type="info" title="Notes">

        [Project Admins](./manage-platform-roles#predefined-project-roles) の場合、このユーザーが API キーに付与できる権限は、ユーザー自身の権限スコープに限定されます。 

        </Admonition>

</Procedures>

## API キーをリセットする\{#reset-an-api-key}

パーソナル API キーまたはカスタマイズされた API キーが漏洩したと思われる場合は、直ちにリセットする必要があります。 

<Admonition type="warning" title="Warning">

この操作により、現在の API キーがリセットされ、無効になります。このキーを使用しているアプリケーションコードは、新しいキー値で関連するコードを更新するまで機能しなくなります。

</Admonition>

キーの種類によって、手順は異なります。

- **パーソナル API キーのリセット**：ロールに関係なく、自分のパーソナル API キーのみをリセットできます。 

    ![reset-personal-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-personal-api-keys.png "reset-personal-api-keys")

- **カスタマイズされた API キーのリセット**：カスタマイズされた API キーをリセットできるのは、Organization Owners と Project Admins のみです。

    ![reset-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/reset-customized-api-keys.png "reset-customized-api-keys")

## API キーを削除する\{#delete-an-api-key}

カスタマイズされた API キーが使用されなくなった場合は、できるだけ早く削除する必要があります。カスタマイズされた API キーを削除できるのは、**Organization Owners** と **Project Admins** のみです。

パーソナルキーは手動で削除できません。ただし、対応するユーザーが組織を離れると、自動的に無効化されて削除されます。 

次のスクリーンショットは、カスタマイズされた API キーを削除する方法を示しています。

<Admonition type="warning" title="Warning">

API キーを削除すると、そのキーを使用しているすべてのサービスについて、Zilliz Cloud リソースへのアクセスが不可逆的に終了します。

</Admonition>

![delete-customized-api-keys](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-customized-api-keys.png "delete-customized-api-keys")

## FAQ\{#faq}

**本番環境で自分のパーソナル API キーを使用してもよいですか？**  

いいえ。**パーソナル API キー**は個々のユーザーアカウントに紐付けられており、ユーザーが組織を離れると自動的に削除されます。キーの所有者のアカウントが削除されると、そのキーに依存しているアプリケーションまたはサービスは直ちに Zilliz Cloud リソースへのアクセスを失います。 

本番環境では、代わりに**カスタマイズされた API キー**を使用してください。カスタマイズされたキーは個々のユーザーアカウントから独立しているため、チームメンバーが組織を離れてもサービスの継続性を保証します。    

