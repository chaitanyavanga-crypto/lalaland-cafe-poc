const MenuRepository = require('../repositories/menu.repository');
const ApiError = require('../utils/ApiError');

const MenuService = {
  async listCategories() {
    return MenuRepository.findCategories();
  },

  async listItems(filters) {
    const { items, total } = await MenuRepository.findItems(filters);
    return {
      items,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    };
  },

  async getItemDetail(itemId) {
    const item = await MenuRepository.findItemById(itemId);
    if (!item) throw ApiError.notFound('Menu item not found');

    const optionRows = await MenuRepository.findOptionGroupsForItem(itemId);

    // Business rule: reshape flat option rows into grouped structure
    // the frontend can render directly (Sweetness -> [values], Ice Level -> [values]...)
    const groupsMap = new Map();
    for (const row of optionRows) {
      if (!groupsMap.has(row.option_group_id)) {
        groupsMap.set(row.option_group_id, {
          optionGroupId: row.option_group_id,
          name: row.name,
          isRequired: row.is_required,
          maxSelectable: row.max_selectable,
          values: [],
        });
      }
      groupsMap.get(row.option_group_id).values.push({
        optionValueId: row.option_value_id,
        label: row.label,
        priceDelta: Number(row.price_delta),
      });
    }

    return { ...item, optionGroups: Array.from(groupsMap.values()) };
  },

  async createItem(data) {
    if (data.basePrice < 0) throw ApiError.badRequest('Base price cannot be negative');
    return MenuRepository.createItem(data);
  },

  async updateItem(itemId, fields) {
    const updated = await MenuRepository.updateItem(itemId, fields);
    if (!updated) throw ApiError.notFound('Menu item not found');
    return updated;
  },

  async toggleAvailability(itemId, isAvailable) {
    return this.updateItem(itemId, { is_available: isAvailable });
  },
};

module.exports = MenuService;
