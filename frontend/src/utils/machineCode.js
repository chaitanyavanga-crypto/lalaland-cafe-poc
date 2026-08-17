/**
 * Generates the "machine code" identifiers shown on the kiosk screen and
 * encoded into the QR payload that the drink-dispensing machine scans.
 *
 * Format (see DrinkCustomize / QRCodeDisplay):
 *   Item code:    3 letters (initials of the drink name) + 3-digit item id
 *                 e.g. "Jasmine Milk Tea" (id 1) -> "JMT001"
 *   Option code:  2-letter dispenser prefix + 3-digit option-value id
 *                 e.g. Cup Size -> "BX003", Sweetness -> "TD001", Ice -> "WD001"
 *   QR payload:   LALALAND_{timestamp}|{itemCode}|{cup}-{sugar}-{ice}
 */

// Maps an option-group name to the physical dispenser it drives on the
// vending machine. Falls back to the group's own initials when no known
// dispenser matches, so any future option group still gets a sensible code.
const DISPENSER_PREFIXES = [
  { match: /cup/i, prefix: 'BX' }, // cup/box dispenser
  { match: /sweet|sugar/i, prefix: 'TD' }, // tea/sugar dose dispenser
  { match: /ice|temperature|hot|cold/i, prefix: 'WD' }, // water/ice dispenser
];

// Preferred left-to-right order for the CUP-SUGAR-ICE segment of the payload.
const DISPENSER_ORDER = ['BX', 'TD', 'WD'];

function prefixForGroup(groupName = '') {
  const known = DISPENSER_PREFIXES.find((entry) => entry.match.test(groupName));
  if (known) return known.prefix;
  const letters = groupName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (letters.slice(0, 2) || 'XX').padEnd(2, 'X');
}

/** e.g. "Jasmine Milk Tea" + id 1 -> "JMT001" */
export function getItemMachineCode(item) {
  if (!item?.name) return '';
  const words = item.name.trim().split(/\s+/).filter(Boolean);
  let initials = words.map((w) => w[0]).join('').toUpperCase();
  initials = (initials.slice(0, 3) || 'XXX').padEnd(3, 'X');
  const idPart = String(item.item_id ?? 0).padStart(3, '0');
  return `${initials}${idPart}`;
}

/** e.g. group "Cup Size", optionValueId 3 -> "BX003" */
export function getOptionMachineCode(group, optionValueId) {
  if (!group || optionValueId == null) return null;
  return `${prefixForGroup(group.name)}${String(optionValueId).padStart(3, '0')}`;
}

/**
 * Builds an ordered { groupId, group, code } list for the currently selected
 * (single-select) value of every option group on the item, in CUP/SUGAR/ICE
 * order first, then any other groups in their original order.
 */
export function getSelectionCodes(item, selections) {
  const groups = item?.optionGroups || [];
  const entries = groups.map((group) => {
    const selectedIds = selections[group.optionGroupId] || [];
    const optionValueId = selectedIds[0];
    return {
      groupId: group.optionGroupId,
      group,
      code: getOptionMachineCode(group, optionValueId),
    };
  });

  return entries.sort((a, b) => {
    const aIdx = DISPENSER_ORDER.indexOf(prefixForGroup(a.group.name));
    const bIdx = DISPENSER_ORDER.indexOf(prefixForGroup(b.group.name));
    const aRank = aIdx === -1 ? DISPENSER_ORDER.length : aIdx;
    const bRank = bIdx === -1 ? DISPENSER_ORDER.length : bIdx;
    return aRank - bRank;
  });
}

/** Joins selection codes with "-", using a placeholder for any unmade selection. */
export function joinSelectionCodes(selectionCodes, placeholder = '---') {
  return selectionCodes.map((entry) => entry.code || placeholder).join('-');
}

/**
 * Builds the full QR payload string.
 * Pass `timestamp: null` to render the literal "{timestamp}" preview token.
 */
export function buildQrPayload({ itemCode, codePart, timestamp }) {
  const ts = timestamp == null ? '{timestamp}' : timestamp;
  return `LALALAND_${ts}|${itemCode}|${codePart}`;
}
