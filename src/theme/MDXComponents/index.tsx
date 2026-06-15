import React, {type ComponentProps, type SVGProps} from 'react';
import Head from '@docusaurus/Head';
import MDXCode from '@theme/MDXComponents/Code';
import MDXA from '@theme/MDXComponents/A';
import MDXPre from '@theme/MDXComponents/Pre';
import MDXDetails from '@theme/MDXComponents/Details';
import MDXHeading from '@theme/MDXComponents/Heading';
import MDXUl from '@theme/MDXComponents/Ul';
import MDXLi from '@theme/MDXComponents/Li';
import MDXImg from '@theme/MDXComponents/Img';
import Admonition from '@theme/Admonition';
import Mermaid from '@theme/Mermaid';

import type {MDXComponentsObject} from '@theme/MDXComponents';

function LniInfo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <circle cx={12} cy={12} r={10} />
      <line x1={12} y1={16} x2={12} y2={12} />
      <line x1={12} y1={8} x2={12.01} y2={8} />
    </svg>
  );
}

function MDXTable(props: ComponentProps<'table'>) {
  const {children, ...rest} = props;
  // Wrap bare <tr> children in <tbody> to fix DOM nesting warnings
  const wrapped = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === 'tr') {
      return <tbody>{child}</tbody>;
    }
    return child;
  });
  // Wrap in a horizontal-scroll container so wide tables scroll instead of
  // squeezing cell text down to 2–3 words per line.
  return (
    <div className="zd-table-scroll">
      <table {...rest}>{wrapped}</table>
    </div>
  );
}

const MDXComponents: MDXComponentsObject = {
  Head,
  table: MDXTable,
  details: MDXDetails,
  Details: MDXDetails,
  code: MDXCode,
  a: MDXA,
  pre: Object.assign(MDXPre, {mdxTag: 'pre'}),
  ul: MDXUl,
  li: MDXLi,
  img: MDXImg,
  h1: Object.assign((props: ComponentProps<'h1'>) => <MDXHeading as="h1" {...props} />, {mdxTag: 'h1'}),
  h2: Object.assign((props: ComponentProps<'h2'>) => <MDXHeading as="h2" {...props} />, {mdxTag: 'h2'}),
  h3: Object.assign((props: ComponentProps<'h3'>) => <MDXHeading as="h3" {...props} />, {mdxTag: 'h3'}),
  h4: Object.assign((props: ComponentProps<'h4'>) => <MDXHeading as="h4" {...props} />, {mdxTag: 'h4'}),
  h5: Object.assign((props: ComponentProps<'h5'>) => <MDXHeading as="h5" {...props} />, {mdxTag: 'h5'}),
  h6: Object.assign((props: ComponentProps<'h6'>) => <MDXHeading as="h6" {...props} />, {mdxTag: 'h6'}),
  admonition: Admonition,
  mermaid: Mermaid,
  // Custom icons used in docs
  LniInfo,
};

export default MDXComponents;
