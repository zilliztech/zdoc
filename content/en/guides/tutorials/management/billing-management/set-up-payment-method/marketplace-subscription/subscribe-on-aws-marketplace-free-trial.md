---
title: "Subscribe to a Free Trial on AWS Marketplace | Cloud"
slug: /subscribe-on-aws-marketplace-free-trial
sidebar_label: "AWS Marketplace (Free Trial)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides a step-by-step walkthrough of the subscription process. | Cloud"
type: origin
token: X6nAwrgYAiJ3Lzku8mBczdbXnuo
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Subscribe to a Free Trial on AWS Marketplace

This guide provides a step-by-step walkthrough of the subscription process. 

## Before you start\{#before-you-start}

- If you need the full version instead of the trial, you must subscribe again through a [public offer](./subscribe-on-aws-marketplace) or [private offer](./subscribe-on-aws-marketplace-private-offer).

- Ensure you have an AWS Marketplace account.

- Set your AWS Buyer ID's default payment method to the Invoicing Plan. [Learn how to change your default payment method](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/manage-payment-method.html).

- If your AWS account is part of an organization, you need to have permissions such as the `AWSMarketplaceManageSubscriptions` managed policy to make purchases.

## Subscribe to a free trial\{#subscribe-to-a-free-trial}

Visit [AWS Marketplace](https://aws.amazon.com/marketplace) and start subscribing to Zilliz Cloud as follows:

<Supademo id="cmpf98x1j009u0l0jk5t2s6j3" title=""  />

<Procedures>

1. Search for **Zilliz Cloud** in the search box, then click **Milvus Vector Database, Zilliz Cloud (Pay-as-you-go)**.

    Or you can directly visit [this page](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?trk=8d276e92-b310-40ce-908f-23a198ca7ffc&sc_channel=el&source=zilliz). 

    ![CGffbQ9Jro826Rxupwvc42Vmn1c](https://zdoc-images.s3.us-west-2.amazonaws.com/cgffbq9jro826rxupwvc42vmn1c.png "CGffbQ9Jro826Rxupwvc42Vmn1c")

1. Click **Try for free**. 

    This option is a 30-day free trial offered by AWS. Once the free trial ends, you need to [upgrade the subscription](./subscribe-on-aws-marketplace) to continue using Zilliz Cloud.

    ![KCGqbey5monHEdxTouNcJkIVneg](https://zdoc-images.s3.us-west-2.amazonaws.com/kcgqbey5monhedxtouncjkivneg.png "KCGqbey5monHEdxTouNcJkIVneg")

1. Scroll down the page and click **Subscribe**. 

    ![PllVbyXrMo9ydWxOG2DcjHkZnGf](https://zdoc-images.s3.us-west-2.amazonaws.com/pllvbyxrmo9ydwxog2dcjhkzngf.png "PllVbyXrMo9ydWxOG2DcjHkZnGf")

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

## Upgrade to paid subscription\{#upgrade-to-paid-subscription}

When you start a free trial of Zilliz Cloud on AWS Marketplace, you get the same features as the regular Zilliz Cloud free trial. For details, see [Try Zilliz Cloud For Free](./free-trials#free-trial). 

During the free trial, a `Free Trial` tag will appear next to AWS Marketplace Subscription on the **Billing Overview** page.

In addition, you can also view the trial details in the top banner.

![OJtZbGmhAoKOC7xlpQsceYtDn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/ojtzbgmhaokoc7xlpqsceytdn0c.png "OJtZbGmhAoKOC7xlpQsceYtDn0c")

For more advanced features, you can upgrade to a paid AWS subscription anytime. To upgrade, simply [subscribe to a public offer](./subscribe-on-aws-marketplace). The new public offer subscription will automatically replace the previous free trial subscription.

<Procedures>

1. Navigate to the [Zilliz Cloud page](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa) on AWS Marketplace.

1. Click **View purchase options**.

1. Scroll down the page and click **Subscribe**.

1. Click **Set up your account** in the prompt.

1. Log into your Zilliz Cloud account and link the AWS Marketplace subscription to a Zilliz Cloud organization.

</Procedures>

For detailed step-by-step guide, see [Subscribe to a Public Offer on AWS Marketplace](./subscribe-on-aws-marketplace).

You can check if the upgrade is successful by navigating to the **Payment Method** card on the **Billing Overview** page. If the `Free Trial` tag next to AWS Marketplace Subscription disappears, the upgrade is successful. 

## Cancel free trial subscription\{#cancel-free-trial-subscription}

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

## FAQ\{#faq}

**Will the AWS Marketplace Free Trial be automatically upgraded when it expires?**

No. When the AWS Marketplace Free Trial ends, you must manually upgrade to a paid subscription to continue using Zilliz Cloud.

**Will I receive notifications when the AWS Marketplace Free Trial is expiring soon?**

Yes. AWS Marketplace sends email notifications before your free trial expires. The notifications are sent to the email address associated with the AWS account that started the trial.

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

    - Ask other users to [invite](./manage-platform-users#invite-organization-members) you to their organizations and grant you the role of an Organization Owner.

