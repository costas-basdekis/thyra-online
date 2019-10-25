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
    from: moment("2019-10-28T12:30:00"),
    until: moment("2019-11-01T00:00:00"),
    name: 'Halloween',
    override: {
      theme: {
        cells: 'halloween',
        pieces: 'halloween-ghost',
        scheme: 'halloween',
      },
    },
  },
];

const getTopicalThemeOverrideAndNextUpdateDate = (on = moment()) => {
  const matchingTopicalTheme = topicalThemes.find(topicalTheme => (
    topicalTheme.from.isSameOrBefore(on) && topicalTheme.until.isSameOrAfter(on)
  ));
  if (matchingTopicalTheme) {
    return {
      override: matchingTopicalTheme.override,
      nextUpdatedDate: matchingTopicalTheme.until,
      name: matchingTopicalTheme.name,
    };
  }

  const nextTopicalTheme = topicalThemes.find(topicalTheme => (
    topicalTheme.from.isSameOrAfter(on)
  ));
  if (nextTopicalTheme) {
    return {override: null, nextUpdatedDate: nextTopicalTheme.from, name: null};
  }

  return {override: null, nextUpdatedDate: null, name: null};
};

export const getApplicableSettingsAndNextUpdateDate = (settings, on) => {
  const {override, nextUpdatedDate, name} = getTopicalThemeOverrideAndNextUpdateDate(on);
  if (settings.theme.useTopicalTheme && override) {
    settings = _.merge({}, settings, override);
  }

  return {applicableSettings: settings, nextUpdatedDate, override, name};
};
