import React from 'react';
import {
  Cloud,
  Server,
  Code,
  Terminal,
  Tag,
  BookOpen,
  Globe,
  Layers,
} from 'lucide-react';
import {PythonIcon, JavaIcon, NodejsIcon, GoIcon, CppIcon, RestIcon} from '../../shared/icons/brands';

/**
 * Shared icon registry for secondary navbar and sidebar product dropdown.
 * Keys correspond to the `icon` field in customFields.secondaryNavbar config.
 */
const ICONS: Record<string, React.ReactElement> = {
  cloud:    <Cloud size={15} />,
  server:   <Server size={15} />,
  code:     <Code size={15} />,
  terminal: <Terminal size={15} />,
  tag:      <Tag size={15} />,
  book:     <BookOpen size={15} />,
  globe:    <Globe size={15} />,
  python:   <PythonIcon size={15} />,
  java:     <JavaIcon size={15} />,
  nodejs:   <NodejsIcon size={15} />,
  go:       <GoIcon size={15} />,
  cpp:      <CppIcon size={15} />,
  rest:     <RestIcon size={15} />,
};

export default ICONS;
