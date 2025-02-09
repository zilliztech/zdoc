---
title: "Manage Projects | Cloud"
slug: /manage-projects
sidebar_label: "Projects"
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters and related resources. You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations. | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - projects
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

---

import Admonition from '@theme/Admonition';


# Manage Projects

In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters and related resources. You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations.

This guide will walk you through the steps of managing projects.

## View projects{#view-projects}

Once you join an organization, you can view the list of all projects in the organization.

![view-projects-saas](/img/view-projects-saas.png)

## Create a project{#create-a-project}

To create a project, you must be an [Organization Owner](./organization-users).

When you create a project, you automatically become the [Project Admin](./project-users) of the project.

<Admonition type="info" icon="📘" title="Notes">

<p>You can create a maximum of 100 projects in each organization.</p>

</Admonition>

![create-project](/img/create-project.png)

## Rename a project{#rename-a-project}

To rename a project, you must be an [Organization Owner](./organization-users).

<Admonition type="info" icon="📘" title="Notes">

<p>Each organization contains a default project. The name of the default project cannot be modified.</p>

</Admonition>

![rename-project](/img/rename-project.png)

## Delete a project{#delete-a-project}

To delete a project, you must be an [Organization Owner](./organization-users).

<Admonition type="info" icon="📘" title="Notes">

<p>Each organization contains a default project. The default project cannot be deleted.</p>

</Admonition>

![delete-project](/img/delete-project.png)

