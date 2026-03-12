import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
import { mathInputRules } from "./mathInputRules";
import type { Plugin } from "prosemirror-state";

export function buildPlugins(): Plugin[] {
  return [
    history(),
    keymap(baseKeymap),
    inputRules({ rules: mathInputRules }),
  ];
}
