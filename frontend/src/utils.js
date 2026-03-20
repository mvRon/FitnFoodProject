export const isJsonString = (data) => {
    try {
        JSON.parse(data)
    } catch (error) {

    }
    return true
}


export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export const getLevelKeys = (items1) => {
    const key = {};
    const func = (items2, level = 1) => {
        items2.forEach((item) => {
            if (item.key) {
                key[item.key] = level;
            }
            if (item.children) {
                func(item.children, level + 1);
            }
        });
    };
    func(items1);
    return key;
};

export const renderOption = (arr) => {
    let results = []
    if (arr) {
        results = arr?.map((option) => {
            return {
                value: option,
                label: option,
            }
        })
    }
    results.push({
        label: 'Thêm Type',
        value: 'add_type',
    })
    return results
}


export const convertPrice = (price) => {
    try {
        const result = price?.toLocaleString().replaceAll(',', '.')
        return `${result} VNĐ`

    } catch (error) {
        return null
    }

}

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};