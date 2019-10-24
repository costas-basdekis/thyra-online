import moment from "moment";
import _ from "lodash";

export const copyToClipboard = text => {
  const textArea = document.createElement("textarea");
  // This won't work
  // textArea.style.display = 'none'
  document.body.appendChild(textArea);
  textArea.value = text;
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export const topicalThemes = [
  {
    from: moment("2019-10-25T12:00:00"),
    until: moment("2019-11-01T00:00:00"),
    override: {
      theme: {
        cells: 'halloween',
        pieces: 'halloween-ghost',
        scheme: 'halloween',
      },
    },
  },
];

const getTopicalThemeOverride = (on = moment()) => {
  for (const topicalTheme of topicalThemes) {
    if (topicalTheme.from.isSameOrBefore(on) && topicalTheme.until.isSameOrAfter(on)) {
      return topicalTheme.override;
    }
  }

  return null;
};

export const getApplicableSettings = (settings, on) => {
  const topicalThemeOverride = getTopicalThemeOverride(on);
  if (topicalThemeOverride) {
    return _.merge({}, settings, topicalThemeOverride);
  }

  return settings;
};
