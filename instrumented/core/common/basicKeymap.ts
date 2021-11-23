function cov_rsju0x8hm() {
  var path = "D:\\coddoc\\pmSeries\\editor\\src\\core\\common\\basicKeymap.ts";
  var hash = "3d8c012e793fd2a4e85978695d3a6f103c3e5e6d";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "D:\\coddoc\\pmSeries\\editor\\src\\core\\common\\basicKeymap.ts",
    statementMap: {
      "0": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 16
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0
    },
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "3d8c012e793fd2a4e85978695d3a6f103c3e5e6d"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_rsju0x8hm = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_rsju0x8hm();
import { pcBaseKeymap } from "prosemirror-commands";
export let {
  Enter,
  'Mod-Enter': ModEnter,
  Backspace,
  'Mod-Backspace': ModBackspace,
  Delete,
  'Mod-Delete': ModDelete,
  'Mod-a': ModA
} = (cov_rsju0x8hm().s[0]++, pcBaseKeymap);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2ljS2V5bWFwLnRzIl0sIm5hbWVzIjpbInBjQmFzZUtleW1hcCIsIkVudGVyIiwiTW9kRW50ZXIiLCJCYWNrc3BhY2UiLCJNb2RCYWNrc3BhY2UiLCJEZWxldGUiLCJNb2REZWxldGUiLCJNb2RBIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZVk7Ozs7Ozs7OztBQWZaLFNBQVNBLFlBQVQsUUFBNkIsc0JBQTdCO0FBRUEsT0FBTyxJQUFJO0FBQ1BDLEVBQUFBLEtBRE87QUFFUCxlQUFhQyxRQUZOO0FBR1BDLEVBQUFBLFNBSE87QUFJUCxtQkFBaUJDLFlBSlY7QUFLUEMsRUFBQUEsTUFMTztBQU1QLGdCQUFjQyxTQU5QO0FBT1AsV0FBU0M7QUFQRiw2QkFRUFAsWUFSTyxDQUFKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcGNCYXNlS2V5bWFwIH0gZnJvbSBcInByb3NlbWlycm9yLWNvbW1hbmRzXCI7XHJcblxyXG5leHBvcnQgbGV0IHtcclxuICAgIEVudGVyLFxyXG4gICAgJ01vZC1FbnRlcic6IE1vZEVudGVyLFxyXG4gICAgQmFja3NwYWNlLFxyXG4gICAgJ01vZC1CYWNrc3BhY2UnOiBNb2RCYWNrc3BhY2UsXHJcbiAgICBEZWxldGUsXHJcbiAgICAnTW9kLURlbGV0ZSc6IE1vZERlbGV0ZSxcclxuICAgICdNb2QtYSc6IE1vZEEsXHJcbn0gPSBwY0Jhc2VLZXltYXBcclxuIl19