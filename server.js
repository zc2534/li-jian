const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// 确保 data 目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dataFile = path.join(dataDir, 'registrations.json');

// 读取已有报名数据
function readRegistrations() {
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('读取报名数据失败:', e.message);
  }
  return [];
}

// 保存报名数据
function saveRegistrations(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
}

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 报名提交 API
app.post('/api/register', (req, res) => {
  const {
    name,
    gender,
    age,
    idCard,
    phone,
    parentName,
    parentPhone,
    health,
    campSession,
    remarks
  } = req.body;

  // 后端验证
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('请填写正确的姓名');
  }
  if (!gender) {
    errors.push('请选择性别');
  }
  if (!age || age < 6 || age > 18) {
    errors.push('年龄需在6-18岁之间');
  }
  if (!idCard || !/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)) {
    errors.push('请填写正确的身份证号码');
  }
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    errors.push('请填写正确的手机号码');
  }
  if (!parentName || parentName.trim().length < 2) {
    errors.push('请填写正确的监护人姓名');
  }
  if (!parentPhone || !/^1[3-9]\d{9}$/.test(parentPhone)) {
    errors.push('请填写正确的监护人电话');
  }
  if (!campSession) {
    errors.push('请选择营期');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // 检查是否重复报名（同身份证号）
  const registrations = readRegistrations();
  const exists = registrations.find(r => r.idCard === idCard && r.campSession === campSession);
  if (exists) {
    return res.status(400).json({
      success: false,
      errors: ['该身份证号已在本期营地报名，请勿重复提交']
    });
  }

  const registration = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    gender,
    age: parseInt(age),
    idCard,
    phone,
    parentName: parentName.trim(),
    parentPhone,
    health: health || '',
    campSession,
    remarks: remarks || '',
    createdAt: new Date().toISOString()
  };

  registrations.push(registration);
  saveRegistrations(registrations);

  console.log(`✅ 新报名: ${name} - ${phone} - ${campSession}`);

  res.json({
    success: true,
    message: '报名成功！我们将在24小时内与您联系确认。',
    data: { id: registration.id, name: registration.name }
  });
});

// 获取报名列表（简单查询，用于管理）
app.get('/api/registrations', (req, res) => {
  const { key } = req.query;
  // 简单的管理密钥验证
  if (key !== 'lijian2026') {
    return res.status(403).json({ success: false, errors: ['无权访问'] });
  }
  const registrations = readRegistrations();
  res.json({ success: true, data: registrations });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('  🎖️  长沙砺剑军事夏令营报名系统');
  console.log('═══════════════════════════════════════');
  console.log(`  本地访问: http://localhost:${PORT}`);
  console.log(`  管理后台: http://localhost:${PORT}/api/registrations?key=lijian2026`);
  console.log('═══════════════════════════════════════');
});
