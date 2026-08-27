---
title: "Subscribe to a Private Offer on AWS Marketplace | BYOC"
slug: /subscribe-on-aws-marketplace-private-offer
sidebar_label: "AWS Marketplace (Private Offer)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A private offer on AWS Marketplace is a custom purchasing option created for your organization by Zilliz. Unlike a public offer, which uses the standard pricing and terms shown on the AWS Marketplace product page, a private offer can include negotiated pricing, custom contract terms, a specific contract duration, and a defined payment schedule. | BYOC"
type: origin
token: QGVxwmnGTidbjtk1LcYcEfqbnOe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Subscribe to a Private Offer on AWS Marketplace

A private offer on AWS Marketplace is a custom purchasing option created for your organization by Zilliz. Unlike a public offer, which uses the standard pricing and terms shown on the AWS Marketplace product page, a private offer can include negotiated pricing, custom contract terms, a specific contract duration, and a defined payment schedule.

Use a private offer when your organization needs custom commercial terms, such as discounted pricing, committed spend, enterprise procurement terms, or a contract that is tied to a specific AWS account. Private offers are only visible to the AWS account IDs that Zilliz includes in the offer.

If you need a private offer for Zilliz Cloud, [contact your Zilliz account executive](https://zilliz.com/contact-sales). Provide the AWS account ID that should receive the offer, your expected contract term, usage requirements, and any procurement or billing requirements your organization needs to include.

## Before you start\{#before-you-start}

Before you subscribe to a private offer on AWS Marketplace, make sure:

- You have a Zilliz Cloud account and [organization](./organization-settings).

- You have an [AWS account ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/console-account-id.html) that should receive and accept the private offer.

- You have the permission to subscribe to AWS Marketplace products, such as the `AWSMarketplaceManageSubscriptions` managed policy.

- You are an Organization Owner or Organization Billing Admin on Zilliz Cloud. These permissions are required to link a Marketplace subscription to a Zilliz Cloud organization.

## Subscribe to a private offer\{#subscribe-to-a-private-offer}

The following is an overview of the subscription process.

![I0BNwWPPnhoWZrbMZWnccBE1nYe](https://zdoc-images.s3.us-west-2.amazonaws.com/I0BNwWPPnhoWZrbMZWnccBE1nYe.png)

You can follow the detailed step-by-step guide below to subscribe to a Private Offer on AWS Marketplace.

<Procedures>

1.  Contact your Zilliz account executive for the private offer.

    While [contacting your Zilliz account executive](https://zilliz.com/contact-sales), you need to provide your AWS account ID to receive the private offer. 

1. Check your email inbox.

    1. Look for an email from AWS Marketplace with the subject **You have a new Private Offer**. The email includes the AWS account ID that can access the offer.

    1. Click the **AWS Marketplace console private offers page** link in the email. When prompted, sign in to AWS with the same account ID shown in the email. Otherwise, you may not be able to view the private offer.

        ![AAEEwdD8zhamcKbFjB8cr1j7nFc](https://zdoc-images.s3.us-west-2.amazonaws.com/AAEEwdD8zhamcKbFjB8cr1j7nFc.png)

        <Admonition type="info" icon="📘" title="Note">

        You must accept the offer before its expiration date. If the offer has expired, contact your account executive.

        </Admonition>

1. Review the offer details and accept the offer.

    To include a purchase order (PO) number on your invoice, select **Add a purchase order** and enter the required information. If you do not need a purchase order, select **No purchase order**.

    Click **Accept offer**.

    ![Xn6qwEcmihhj0LbwOXicnRgMnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/Xn6qwEcmihhj0LbwOXicnRgMnCh.png)

1. Wait for the request to complete.

    AWS Marketplace displays a message "Y*our request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*"

    ![TrnVwl8sHhW8yLbHI0bcVMO7ntf](https://zdoc-images.s3.us-west-2.amazonaws.com/TrnVwl8sHhW8yLbHI0bcVMO7ntf.png)

1. Set up your account.

    When the request is complete, a green confirmation banner appears at the top of the AWS Marketplace page.

    Click **Set up your account**. You will be redirected to Zilliz Cloud.

    <Admonition type="info" icon="📘" title="Note">

    You must complete this step. Otherwise, your private offer subscription is not linked to any Zilliz Cloud organization.

    </Admonition>

    ![PJGGwBu6nh8lSQbZK1ac2wfhn0d](https://zdoc-images.s3.us-west-2.amazonaws.com/PJGGwBu6nh8lSQbZK1ac2wfhn0d.png)

1. Link Marketplace subscription to Zilliz Cloud organization.

    1. Log into your Zilliz Cloud account.

        ![Q6PDbtOwioM06kxe46ecIAKCnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/q6pdbtowiom06kxe46eciakcnmh.png "Q6PDbtOwioM06kxe46ecIAKCnMh")

    1. Select a Zilliz Cloud organization to link to the Marketplace subscription.

        If no organization is available to select, or if you have any questions, contact [Zilliz Support](http://support.zilliz.com).

        ![HvVkbNvp9oe5wIxkdWvcDMWJnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/hvvkbnvp9oe5wixkdwvcdmwjnnc.png "HvVkbNvp9oe5wIxkdWvcDMWJnNc")

    1. When the process is complete, the following confirmation window appears.

        ![REvibD9Nvog0X9xsNGMcwrvynTg](https://zdoc-images.s3.us-west-2.amazonaws.com/revibd9nvog0x9xsngmcwrvyntg.png "REvibD9Nvog0X9xsNGMcwrvynTg")

    1. On the Zilliz Cloud **Billing** page, find the **Payment Method** section. You can verify your subscription by hovering on the ID icon.

        ![NjQObiKEco940qxMYSpc8g0mnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/njqobikeco940qxmyspc8g0mnhb.png "NjQObiKEco940qxMYSpc8g0mnHb")

</Procedures>

## Renew your private offer\{#renew-your-private-offer}

When your private offer is close to expiration, Zilliz will send you a new private offer link for renewal. If you have questions about the renewal process, contact your account executive.

<Admonition type="info" icon="📘" title="Note">

For AWS Marketplace, renewal works as accepting a new private offer. After you accept it, the new offer automatically replaces the previous one. You still need to link the new offer to your Zilliz Cloud organization again.

</Admonition>

The following is an overview of the renewal process.

![GKcDwCIv4hVc12bEFPvcXshQniR](https://zdoc-images.s3.us-west-2.amazonaws.com/GKcDwCIv4hVc12bEFPvcXshQniR.png)

You can follow the detailed step-by-step guide below to subscribe to a Private Offer on AWS Marketplace.

<Procedures>

1. Check your email inbox.

    1. Look for an email from AWS Marketplace with the subject **You have a new Private Offer**. The email includes the AWS account ID that can access the offer.

    1. Click the **AWS Marketplace console private offers page** link in the email. When prompted, sign in to AWS with the same account ID shown in the email.

        ![GvHEwgn55hnE1fbRg1Mcg8UEnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/GvHEwgn55hnE1fbRg1Mcg8UEnOc.png)

1. On the AWS Marketplace page, go to the **Your offers** section and confirm that the correct offer is selected. The **Offer ID** should match the ID shown in the email.

    You will be prompted "**Accepting this offer replaces your current agreement**".

    ![NLAjwwr9ahgutebTFJKcVyntnxb](https://zdoc-images.s3.us-west-2.amazonaws.com/NLAjwwr9ahgutebTFJKcVyntnxb.png)

1. Review the offer details and accept the offer.

    To include a purchase order (PO) number on your invoice, select **Add a purchase order** and enter the required information. If you do not need a purchase order, select **No purchase order**.

    Click **Accept offer**.

    ![YHQxwYXemhfrvubRftzcjBSPn7e](https://zdoc-images.s3.us-west-2.amazonaws.com/YHQxwYXemhfrvubRftzcjBSPn7e.png)

1. Wait for the request to complete.

    AWS Marketplace displays a message "*Your request is in progress, this will take a few minutes. Don't refresh or close this page. Meanwhile, you can set up your account on the vendor's website.*"

    <Admonition type="info" icon="📘" title="Note">

    Do **not** click "Set up your account" at this point. Please wait until the request is complete.
    
    If you click it before the request is complete, you may see "No organization available" when linking the offer to a Zilliz Cloud organization. This happens because the previous private offer has not been unlinked yet.

    </Admonition>

1. Set up your account.

    When the request is complete, a green confirmation banner appears at the top of the AWS Marketplace page.

    Click **Set up your account**. You will be redirected to Zilliz Cloud.

    <Admonition type="info" icon="📘" title="Note">

    You must complete this step. Otherwise, your private offer subscription is not linked to any Zilliz Cloud organization.

    </Admonition>

    ![SEMzwPBZNh5ejWbOOdAcmPJunRf](https://zdoc-images.s3.us-west-2.amazonaws.com/SEMzwPBZNh5ejWbOOdAcmPJunRf.png)

1. Link Marketplace subscription to Zilliz Cloud organization.

    1. Log into your Zilliz Cloud account.

        ![U3fHb1ZF1o9AWnxYyztcTcpBnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/u3fhb1zf1o9awnxyyztctcpbnxe.png "U3fHb1ZF1o9AWnxYyztcTcpBnXe")

    1. Select a Zilliz Cloud organization to link to the Marketplace subscription.

        If no organization is available to select, or if you have any questions, contact [Zilliz Support](http://support.zilliz.com).

        ![KgGJbyKCsoT15cxTzgDcsadWnHc](https://zdoc-images.s3.us-west-2.amazonaws.com/kggjbykcsot15cxtzgdcsadwnhc.png "KgGJbyKCsoT15cxTzgDcsadWnHc")

    1. When the process is complete, the following confirmation window appears.

        ![Rbp1bcYjJoFfyjxf2s7cLO8KnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/rbp1bcyjjoffyjxf2s7clo8knqh.png "Rbp1bcYjJoFfyjxf2s7cLO8KnQh")

    1. On the Zilliz Cloud **Billing** page, find the **Payment Method** section. You can verify your subscription by hovering on the ID icon.

        ![G15cbgalfoDgRExOSBWcfbzlnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/g15cbgalfodgrexosbwcfbzlnxd.png "G15cbgalfoDgRExOSBWcfbzlnxd")

</Procedures>

## Switch from a public offer to a private offer\{#switch-from-a-public-offer-to-a-private-offer}

Similar to [private offer renewal](./subscribe-on-aws-marketplace-private-offer#renew-your-private-offer), switching from a public offer to a private offer requires you to accept a new private offer. After you accept it, the new private offer automatically replaces the previous public offer. You still need to link the new offer to your Zilliz Cloud organization again.

## Cancel private offer subscription\{#cancel-private-offer-subscription}

You can cancel your private offer subscription from AWS Marketplace. 

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

**What will happen if my private offer expires and is not renewed?**

If your private offer expires and is not renewed, your AWS Marketplace subscription will lose the private offer terms. If no valid payment method or remaining credits are available for your Zilliz Cloud organization, access to advanced features will be disabled and the organization will be frozen.

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

