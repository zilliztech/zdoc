---
displayed_sidebar: paasSidebar
slug: /docs/byoc/activate-your-cloud
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Activate Your Cloud

Activating your cloud in Zilliz Cloud is a straightforward process that enables you to leverage the power and flexibility of a Bring Your Own Cloud (BYOC) license. This guide provides you with the necessary steps to initiate your cloud services with Zilliz Cloud and ensure your subscription is up and running smoothly.

## Step 1: Verify subscription and start activation{#step-1-verify-subscription-and-start-activation}

Upon subscribing to a BOYC license of Zilliz Cloud, you will receive a welcome email containing all the essential subscription information, including your license ID, core size, and validity period.

1. **Verify Subscription Details**: Before anything else, ensure that all the details in your welcome email are accurate and reflect your subscription correctly. This is crucial as these details are necessary for the activation process.

1. **Start Activation**:
    1. From the same welcome email, click the **Activate Cloud Region** button. This will direct you to the Zilliz Cloud console.

    1. Zilliz Cloud automatically establishes a **Default Organization**, designated as **BYOC** in the web console, upon your subscription to a BYOC license.

    1. To activate your cloud region, you must hold the role of the [Organization Owner](./a-panorama-view#organization-roles) within this **Default Organization**.

![activate-your-cloud-1](/byoc/activate-your-cloud-1.png)

## Step 2: Activate cloud region{#step-2-activate-cloud-region}

The Zilliz Cloud console provides a user-friendly wizard that guides you through the activation. Follow the steps as prompted by the interface. The critical aspect of this process is obtaining an [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html).

To get your ARN, follow the guide, which utilizes the provided external ID.

![activate-your-cloud-2](/byoc/activate-your-cloud-2.png)

## Step 3: Confirm activation{#step-3-confirm-activation}

Once all the necessary details are entered and the configuration is set, you can confirm and finalize the activation. Then, your cloud region will be active, and you can start deploying Zilliz Cloud clusters on your cloud.

## Considerations{#considerations}

- Currently, the BYOC license supports only AWS **us-west-2 (Oregon) **region.

- For security, only [Organization Owners](./a-panorama-view#organization-roles) have permission to activate a cloud region.

## Related topics{#related-topics}

- [Quick Start](./)

- [Install SDKs](./install-sdks)

- [Example Dataset](./example-dataset)
