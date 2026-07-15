---
title: "Subscribe to a Public Offer on AWS Marketplace | Cloud"
slug: /subscribe-on-aws-marketplace
sidebar_label: "AWS Marketplace (Public Offer)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on AWS Marketplace. | Cloud"
type: origin
token: LDlOweEzmiLkdQkvPFec5lrcnbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Subscribe to a Public Offer on AWS Marketplace

This guide provides a step-by-step walkthrough of the subscription process and outlines the pricing terms of Zilliz Cloud on AWS Marketplace. 

<Admonition type="info" icon="📘" title="📘 Note">

Once subscribed, you can pay for the usage of AWS clusters via AWS Marketplace. If you have clusters deployed on other cloud providers, you can also use AWS Marketplace to pay.

</Admonition>

## Before you start\{#before-you-start}

- Ensure you have an AWS Marketplace account.

- Set your AWS Buyer ID's default payment method to the Invoicing Plan. [Learn how to change your default payment method](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html).

- If your AWS account is part of an organization, you must be authorized to make purchases by the billing administrator.

## Subscribe to a public offer\{#subscribe-to-a-public-offer}

Visit [AWS Marketplace](https://aws.amazon.com/marketplace) and start subscribing to Zilliz Cloud as follows:

<Supademo id="cm9hwfyvq1zgoljv5tu13vdk6" title=""  />

<Procedures>

1. Search for **Zilliz Cloud** in the search box, then click **Milvus Vector Database, Zilliz Cloud (Pay-as-you-go)**.

    Or you can directly visit [this page](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz). 

    ![UNGcb105Oo319KxghYwciqeCntf](https://zdoc-images.s3.us-west-2.amazonaws.com/ungcb105oo319kxghywciqecntf.png "UNGcb105Oo319KxghYwciqeCntf")

1. Click **View purchase options**.

    ![UQ0Bbe7huojVMUxpjWccXT6enkb](https://zdoc-images.s3.us-west-2.amazonaws.com/uq0bbe7huojvmuxpjwccxt6enkb.png "UQ0Bbe7huojVMUxpjWccXT6enkb")

1. Scroll down the page and click **Subscribe**. 

    ![XAn8bszmeoIRJbxUml1cmXJQned](https://zdoc-images.s3.us-west-2.amazonaws.com/xan8bszmeoirjbxuml1cmxjqned.png "XAn8bszmeoIRJbxUml1cmXJQned")

1. Follow the prompt to **Set up your account** on Zilliz Cloud.

    ![set-up-account](https://zdoc-images.s3.us-west-2.amazonaws.com/set-up-account.png "set-up-account")

1.  In the new tab, follow the steps below to complete subscription.

    1. If you already have a Zilliz Cloud account, simply log in. If not, choose a [sign-up option](./register-with-zilliz-cloud) and follow the process. Ensure all query strings in the URL are retained to link your AWS identity to your Zilliz Cloud account.

        <Admonition type="info" icon="📘" title="Notes">

        AWS Marketplace uses query strings in the URL to pass your identity information to Zilliz Cloud. Any sign-up failures may result in the loss of these query strings. As a result, Zilliz Cloud may fail to associate your AWS identity with your account registered with us. If this happens, simply return to AWS Marketplace and click <b>Set up your account</b> again.

        </Admonition>

    1. Link your subscription to an existing Zilliz Cloud organization.

        ![aws-marketplace-dialog](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-dialog.png "aws-marketplace-dialog")

    1. Complete authorization.

1. Go to **Billing** to ensure your AWS Marketplace subscription is set as your payment method.

    ![aws-marketplace-success](https://zdoc-images.s3.us-west-2.amazonaws.com/aws-marketplace-success.png "aws-marketplace-success")

</Procedures>

## Update subscription or payment method\{#update-subscription-or-payment-method}

After successfully subscribing from Marketplace, you can always update your subscription at any time that you see fit. 

More specifically, you can either:

- Change the Marketplace account used for the subscription to another one

- Switch your payment method from Marketplace subscription to a credit card.

For details, see [Update Payment Method](./update-payment-method).

## Switch to a private offer\{#switch-to-a-private-offer}

For details, see [Subscribe to a Private Offer on AWS Marketplace](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer).

## Cancel public offer subscription\{#cancel-public-offer-subscription}

<Admonition type="info" icon="📘" title="Note">

After you cancel the subscription, your organization loses access to advanced Zilliz Cloud features. If your organization has no remaining credits, or if all credits have expired, it is frozen immediately.

</Admonition>

<Procedures>

1. Sign in to the AWS account that accepted the private offer.

1. Open the AWS Marketplace console and go to **Manage subscriptions**.

1. Find your Zilliz Cloud subscription and click on the agreement ID.

1. Under **Agreement**, open the **Actions** list and choose **Cancel subscription**.

1. In the **Cancel subscription** dialog box, enter **confirm**, then choose **Yes, cancel subscription**.

</Procedures>

For details, refer to [Canceling product subscriptions](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html).

## Troubleshooting\{#troubleshooting}

**What I can do if there is no organization available when linking a marketplace subscription to Zilliz Cloud?**

There could be several reasons.

- **Insufficient permissions** 

    This can happen when you do not have sufficient privileges. You will see an **"Insufficient Permissions"** tag next to the unavailable organization.

    ![insufficient-permission-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/insufficient-permission-subscription.png "insufficient-permission-subscription")

    To link an organization with a marketplace subscription, you must be an **Organization Owner** or an **Organization Billing Admin**. But if you are only an Organization Member, you do not have the required permissions. Please contact the organization owner for assistance.

- **All organizations have already been successfully linked to a Marketplace subscription**

    This can happen when all your organizations are already linked to Marketplace subscriptions. You will see a **"Marketplace Linked"** tag next to the unavailable organization.

    ![marketplace-already-linked-subscription](https://zdoc-images.s3.us-west-2.amazonaws.com/marketplace-already-linked-subscription.png "marketplace-already-linked-subscription")

    In this case,

    - If you need to update an existing marketplace subscription, please unlink the current subscription of the organization first and then set up a new subscription.

    - If you need multiple organizations for different Marketplace subscription, you can [create an organization](./organization-settings#create-an-organization).

- **No organizations in the list**

    - This can happen if your account has been closed or if you have left all organizations. Your UI will be similar to the following.

    ![no-organization-during-subcription](https://zdoc-images.s3.us-west-2.amazonaws.com/no-organization-during-subcription.png "no-organization-during-subcription")

    In this case, you can:

    - [Create a new organization](./organization-settings#create-an-organization).

    - Ask other users to [invite](./organization-users#invite-a-user-to-your-organization) you to their organizations and grant you the role of an Organization Owner.

