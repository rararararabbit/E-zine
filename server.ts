import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// Mock articles data
const articles = [
  {
    id: "arch-1",
    module: "架构殿堂",
    category: "规范园地",
    title: "BIP数据库对象命名规范",
    summary: "介绍BIP数据库对象（表、字段、索引、主外键、视图等）命名的相关规范",
    content: `## 1.1 表

命名的总体原则

- **【强制】** 通过对象名（包括库名、表名、字段名、索引名），能快速了解对象所属模块、业务含义或主要实现功能。

- **【强制】** schema命名平台库为 iuap_产品_业务含义库名，领域库为 yonbip_领域_业务含义库名，本地化库为 lc_产品_业务含义库名。

- **【强制】** 对象名应简洁明了，表名、字段名、索引名长度不能超过48个字符，为其他业务扩展预留一定长度（例如特征表会添加后缀_1/_2）。

- **【强制】** 对象名应保证一定范围内的唯一性，防止对象重名。例如索引：Oracle的是schema内不重复；MySQL为表内不重复。建议对象名全局唯一。

- **【强制】** 对象名禁止使用数据库的关键字和保留字，详见【3.6.4多数据库适配-关键字】。

- **【强制】** 业务表名前需要增加领域标识前缀或产品或模块标识前缀。

- **【强制】** 临时库、表名必须以 tmp_ 为前缀，如果是按照日期生成的，以 tmp_日期_ 为前缀，tmp_{YYYYMMDD}_{table_name}，tmp_20240301_xxx。

- **【强制】** 备份库、表必须以 bak_ 为前缀，如果是按照日期生成的，以 bak_日期_ 为前缀，bak_{YYYYMMDD}_{table_name}，bak_20240301_xxx。

- **【强制】** 待删除表必须以 del_ 为前缀，如果是按照日期生成的，以 del_日期_ 为前缀，del_{YYYYMMDD}_{table_name}，del_20240301_xxx，DBA自动删除半年前待删除表。

- **【强制】** 命名只能使用英文字母，数字和下划线，字母全部小写并且作为对象命名开头。

- **【强制】** 命名应使用富有意义英文词汇或简写，不要使用n1、n2或拼音简写之类难以阅读的命名规则。

- **【强制】** 新建的业务表租户id的命名统一为 ytenant_id，类型为 varchar(36)，属性 NOT NULL，建议不设置默认值（如果程序未对ytenant_id赋值，程序直接报错）。对历史业务表增加ytenant_id字段，为了兼容专属化脚本及多数据库适配，需要携带默认值，默认值禁止是空字符串。表中必须带有索引 i_ytenant_id 或 ytenant_id 开头的前缀索引。主表带租户id字段时，子表定义也需要包含租户id字段。禁止业务表缺失ytenant_id字段，按BIP规范针对0租户预置数据 ytenant_id 为字符串0，租户数据 ytenant_id 为友互通租户ID，其他非0租户非租户数据程序统一设置为字符串 'N'。禁止 ytenant_id 字段值不正确。

固定表

- **【建议】** 固定表表名一般为"产品或模块标识前缀_业务表英文含义"。

- **例如：**org_factory_define 表，org为模块名，factory_define为工厂组织自定义项表。

- 主子表命名规则：父表（表头）命名为"前缀标识_业务表英文含义_h"，子表（表体）命名为"前缀标识_业务表英文含义_b"，孙表命名为"前缀标识_业务表英文含义_g"，平行表命名为"前缀标识_业务表英文含义_ext"。

- 生产环境如果表需要删除，请先 rename 原表为 del_20240301_原表名，DBA自动删除半年前的 del_{YYYYMMDD}_{table_name} 表。

临时表

- **【强制】** 数据库真正临时表一律使用"tmp_"开头，其余部分参考业务表命名。例如：tmp_md_xxxx

## 1.2 字段

- **【强制】** 短英文单词或者长英文单词的缩写。字段顺序常用字段放在前面，系统字段放后面。

- 具体命名可以参考如下表格：

| 类型 | 规范 | java类型 | 数据库字段类型 | 取值规范 | 是否强制 | 示例 |
| --- | --- | --- | --- | --- | --- | --- |
| Boolean | b开头 | Boolean | smallint | 0：false1：true | 强制 | java字段：bEnable数据库字段：b_enable |
| 枚举 | e开头 | String | varchar(36) | 元数据引用枚举，自定义枚举不在该约束范围内 | 推荐 |  |
| 参照主键 | id结尾 | 按引用字段存储类型，Long或String | 按引用字段存储类型bigint 或 varchar(36) |  | 强制 | java字段：orgId数据库字段：org_id |
| 顺序 | i开头 | Integer | int |  | 强制 | java字段：iOrder数据库字段：i_order |
| 金额 | amount结尾 | BigDecimal | decimal(20,8) |  | 强制 | java字段：natAmount数据库字段：nat_amount |
| 编码 | code结尾 | String | BIP编码规则调大建议：1.单据编码：统一把单据code字段调大到50；2.档案类编码：由档案产品决定 |  | 推荐 | java字段：orgCode数据库字段：org_code |
| 名称 | name结尾 | String | varchar(200) |  | 推荐 | java字段：customerName数据库字段：customer_name |
| 年月日 | date结尾 | Date | datetime |  | 推荐 | java字段：excuteDate数据库字段：excute_date |
| 年月日时分秒 | datetime结尾 | Date | datetime |  | 推荐 | java字段：excuteDatetime数据库字段：excute_datetime |
| 子表关联主表外键 | mainId | String | varchar(22) |  | 推荐 | java字段：mainId数据库字段：main_id |
| 孙表关联子表主键 | parentId | String | varchar(22) |  | 推荐 |  |
| 孙表关联主表主键 | mainId | String | varchar(22) |  | 推荐 |  |

## 1.3 主键

- **【强制】** 主键统一以"id"命名。例如：md_column表的主键名为id。

## 1.4 外键

- **【强制】** 不允许在数据库中创建外键，引用完整性由程序控制。

## 1.5 索引

- **【强制】** 索引以"i_"开头，唯一索引以"i_u_"开头，后面接表名/列名。

- **例如：**表 t1(c1 int，c2 varchar(20)，c3 varchar(20)，…)

- t1(c1，c2) 的索引命名为 i_t1_c1_c2 或 i_c1_c2

- t1(c1，c3) 的唯一索引命名为 i_u_t1_c1_c3 或 i_u_c1_c3

- 多数据库适配中，翻译器会在索引名前面添加表名，所以表名加索引名总长度不超过60个字符。

## 1.6 视图

- **【强制】** 在公有云禁止使用视图。

- **说明：**视图中表关联查询的成本很高，容易产生性能问题，因此不推荐使用。

## 1.7 触发器

- **【强制】** 在公有云禁止使用触发器。

- **说明：**不同种类数据库迁移时，触发器移植的成本很高，因此禁止使用。

## 1.8 自定义函数

- **【强制】** 在公有云禁止使用自定义函数。

- **说明：**不同种类数据库迁移时，自定义函数移植的成本很高，因此禁止使用。

## 1.9 存储过程

- **【强制】** 在公有云业务上禁止使用存储过程。

- **说明：**不同种类数据库迁移时，存储过程移植的成本很高，因此禁止使用。

## 1.10 注释

- **【强制】** 表与列上必须添加注释，注释必须言简意赅。

- 注释只能使用中文、英文、数字、:(冒号)、-(中划线)、=(等号)、_(下划线)、()(括号)。

- 表注释举例：org:业务单元

- 列注释举例：消费模式(0:默认 1:推送模式 2:拉取模式)

- 平台业务模块在领域库内建表，注释必须为 iuap:XX模块:表用途，以便清晰知道schema中表是谁创建的。`
  },
{
    id: "arch-2",
    module: "架构殿堂",
    category: "安全哨所",
    title: "BIP安全编码的输入管理",
    summary: "介绍BIP安全编码规范的输入管理部分：不可信输入须编码转义防XSS，禁止动态拼接SQL/XPath，XML禁用DTD，防反序列化漏洞，禁止弱口令等",
    content: `- **【强制】** 不可信输入数据必须先编码/转义，防范跨站脚本（XSS）等注入类攻击

核心定义与风险说明

- ●风险定义

将不可信数据（外部输入、用户参数、接口返回值等）未经编码 / 转义直接输出到页面，攻击者可注入 <script>、javascript: 等恶意脚本，触发跨站脚本攻击（XSS），导致用户会话被盗、页面篡改、敏感信息窃取等严重安全风险；

- ●防护目标

所有不可信数据必须按输出场景做对应编码 / 转义，确保浏览器只解析为纯文本，不解析为可执行脚本。

核心安全规则

- ●不可信数据必须编码 / 转义后输出（强制）

禁止将原始不可信数据直接输出到 HTML、JS、CSS、URL、XML 等上下文；

- ●必须使用成熟安全库编码（强制）

优先使用 OWASP Java Encoder、Spring Security 编码工具，禁止手写编码逻辑；

- ●必须场景化编码（强制）

不同输出上下文使用对应编码方式，不可混用、不可通用；

- ●输入校验 + 输出编码双重防护

编码前先做白名单 / 正则校验，过滤恶意载荷，形成双层防护。

禁止/不推荐的行为

- ✗禁止仅依赖 “黑名单过滤”（如替换 <script> 标签），易被绕过（如 <scr<script>ipt> 变形绕过）；

- ✗禁止统一使用一种编码方式适配所有场景（如仅做 HTML 编码却输出到 JS 上下文，仍存在风险）；

- ✗禁止忽略 “富文本场景”：若业务需支持富文本，需使用专业的 HTML 清理库（如 OWASP HTML Sanitizer）过滤非法标签/属性，而非仅编码。

补充安全要求

- ●前后端协同防护：服务端必须作为编码/转义的核心防线，前端可补充校验，但不得依赖前端过滤（前端校验可被轻易绕过）；

- ●敏感数据处理：编码后仍需对密码、手机号等敏感数据进行脱敏（如手机号显示为 138****1234），避免编码后泄露；

- ●编码结果验证：对关键场景的编码结果进行测试，确保特殊字符（如 emoji、全角符号、控制字符）编码后不影响正常显示，且无安全风险。

错误示例：直接输出不可信数据/仅黑名单过滤

| // 高危：直接输出客户端输入，存在 XSS 风险String untrustedInput = request.getParameter("username");response.getWriter().write("<div>欢迎你：" + untrustedInput + "</div>");// 攻击者传入：<script>alert('XSS')</script>，将执行恶意脚本// 低效：仅黑名单过滤，易被绕过String filteredInput = untrustedInput.replace("<script>", "").replace("javascript:", "");response.getWriter().write("<div>欢迎你：" + filteredInput + "</div>");// 攻击者传入：<scr<script>ipt>alert('XSS')</scr<script>ipt>，过滤后仍为 <script>alert('XSS')</script> |
| --- |

正确示例：

| import org.apache.commons.text.StringEscapeUtils;public static String xssSafeFilterUrl(String str) {// 防御空指针异常if (str == null) {return null;}// 先解码十六进制编码再进行检测String decodedStr = decodeHexEscapes(str);// 判断解码后的字符串是否包含XSS攻击特征if (!isXSSSafe(decodedStr)) {try {// 使用工具类将危险字符转义为安全的HTML实体String safeStr = StringEscapeUtils.escapeHtml4(decodedStr);// 记录安全拦截的告警日志及原始参数logger.warn("xssSafeFilterUrl-html-escaped, safeStr:{}, str:{}", safeStr, str);// 返回转义后的安全字符串return safeStr;} catch (Exception e) {// 捕获转义过程中可能出现的未知异常logger.error("xssSafeFilterUrl error, return empty string for safety. [msg = {}]", e.getMessage(), e);// 异常时返回空字符串，防止恶意数据被放行return "";}}// 检测安全则直接返回原始字符串return str;} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| Reflected_XSS | High |
| GWT_Reflected_XSS | High |
| Reflected_XSS_All_Clients | High |
| Stored_XSS | High |
| GWT_DOM_XSS | Medium |
| CGI_Reflected_XSS_All_Clients | Medium |
| CGI_Stored_XSS | Medium |

- **【强制】** 禁止将HTTP标题头中的任何未加密信息作为安全决策依据

核心定义与风险说明

- ●不可信来源：HTTP 请求头（Request Headers）中的所有字段均由客户端/浏览器构造发送，可被任意篡改、伪造、删除，无任何天然可信性；

- ●安全风险：若直接将请求头明文信息作为权限判断、身份认证、访问控制、业务校验等安全决策依据，攻击者可轻易伪造请求头绕过安全校验，导致越权访问、数据泄露、业务漏洞；

- ●典型风险头：Referer、Origin、X-Forwarded-For、X-Real-IP、User-Agent、自定义请求头等均不可直接用于安全决策。

核心安全规则

- ●绝对禁止项

严禁直接使用任何未加密、未签名、未校验的 HTTP 请求头字段作为安全决策依据，包括但不限于：

- 1) 禁止以 Referer/Origin 作为唯一的接口访问权限校验、接口防盗链依据；

- 2) 禁止以 X-Forwarded-For/X-Real-IP 作为唯一的客户端真实 IP 校验、IP 白名单依据；

- 3) 禁止以自定义请求头（如 userId、role、token）明文作为身份认证、权限分配依据；

- 4) 禁止以 User-Agent 作为唯一的设备可信性、访问合法性判断依据。

- ●合规使用要求

- 1) 安全凭证必须使用加密、签名、服务端签发的格式（如 JWT、SessionId、OAuth2 Token），且不依赖请求头明文；

- 2) 若必须使用请求头辅助校验（如 Origin 校验），必须：

- a) 采用白名单严格校验合法值；

- b) 仅作为辅助防护，不能作为核心安全依据；

- c) 必须搭配核心认证机制（Token/会话）；

- 3) 客户端 IP 获取：必须在网关/反向代理层做可信配置，禁止直接信任前端传递的 X-Forwarded-For 等 IP 头；

- 4) 自定义安全头：必须使用加密+签名，服务端先验签/解密，再使用，禁止明文传输。

禁止/不推荐的行为

- ✗禁止仅通过请求头完成身份认证、权限判断、越权防护；

- ✗禁止将敏感业务标识（用户 ID、角色、密钥）以明文放在请求头中；

- ✗禁止信任未经网关清洗的客户端传递的 X-Forwarded-For 等扩展头；

- ✗禁止将 Referer 校验作为 CSRF 唯一防护手段。

补充安全要求

- ●所有安全决策必须基于服务端存储/签发的可信凭证（Session、数据库会话、签名 Token）；

- ●对异常请求头（伪造 IP、非法 Origin、空 Referer）进行日志记录与告警；

- ●前后端分离/微服务场景：内部服务间通信必须使用内网可信链路+签名认证，不依赖外部请求头。

错误示例：直接信任请求头做安全校验。

| // 严重违规：直接用 Referer 做权限校验，可轻易伪造String referer = request.getHeader("Referer");if (referer == null || !referer.contains("trust.com")) {response.sendError(403);}// 严重违规：直接信任 X-Forwarded-For 做IP白名单String clientIp = request.getHeader("X-Forwarded-For");if (!"192.168.1.100".equals(clientIp)) {// 攻击者可直接伪造该头绕过}// 严重违规：用明文请求头做身份认证String userId = request.getHeader("X-User-Id");queryUserInfo(userId); // 越权漏洞 |
| --- |

正确示例：YHT默认使用cookie种的A00和YhtAccessToken进行用户身份校验

| protected void restoreInvocationByA00(HttpServletRequest servletRequest,final String yhtAccessToken,String a00,RequestContextDTO requestContextDTO) {// 1. 解析并校验 A00 签名InvocationInternals.InvocationInfoBuild invocation = YmsContextUtils.genInvocation((key) -> HttpUtil.getByHeaderCookie(key, servletRequest, servletRequest.getCookies()),yhtAccessToken,a00);if (null == invocation) {logger.error("A00签名校验失败,a00:" + HttpUtil.getByHeaderCookie("a00", servletRequest, servletRequest.getCookies()));InvocationInternals.initInvocationInfoContext((new InvocationInternals.InvocationInfoBuild()).setExtendAttribute("newInvocation", ContextState.A00_INVALID.getCode()));return;}// 2. 校验 YhtAccessTokenString sessionId = this.verifyYhtAccessToken(invocation);if (null == sessionId) {logger.error("YhtAccessToken校验失败:" + invocation.getYhtAccessToken());InvocationInternals.initInvocationInfoContext((new InvocationInternals.InvocationInfoBuild()).setExtendAttribute("newInvocation", ContextState.A00_INVALID.getCode()));return;}// 其他业务逻辑} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| 无 | 无 |

- **【强制】** 禁止动态拼接 XPath 语句，严格防范 XPath 注入

1、核心定义与风险说明

- ●风险定义：

直接将用户输入、外部参数动态拼接到 XPath 查询语句中，攻击者可构造恶意注入语句（如 ' or '1'='1、or 1=1 等），绕过身份校验、非法查询全部数据、遍历敏感 XML 节点，导致越权访问、数据泄露、业务逻辑被绕过等严重安全问题。

- ●防护目标：

杜绝动态拼接 XPath 语句，确保查询语句安全可控，从根源上防御 XPath 注入攻击。

核心安全规则

- ●严禁动态拼接 XPath 语句（强制）

严禁直接将客户端输入、HTTP 参数、外部数据通过字符串拼接、String.format 等方式嵌入 XPath 语句；

- ●首选参数化查询

使用 XPath 标准参数化查询（XPathFunction、VariableResolver）传递参数，实现数据与语句分离；

- ●必须使用白名单校验兜底

无法参数化时，必须对输入做白名单 / 正则校验，仅允许字母、数字、枚举等安全字符；

- ●必须对特殊字符进行转义

对 XPath 特殊字符（' " / ( ) [ ] * | = < > @ : 等）进行安全转义，防止注入绕过；

- ●最小权限查询

限制 XPath 仅能访问指定业务节点，禁止遍历敏感节点

禁止/不推荐的行为

- ✗禁止使用字符串拼接、String.format、MessageFormat 动态生成 XPath；

- ✗禁止直接将用户输入不经校验嵌入查询语句；

- ✗禁止 XPath 查询访问未授权的敏感 XML 节点；

- ✗不推荐仅做空值校验、仅替换单引号等弱防护（极易被绕过）。

4、补充安全要求

- ●对 XPath 查询的输入和执行结果进行日志记录（脱敏后），便于审计和注入攻击追溯；

- ●限制 XPath 查询的权限范围（如仅允许查询指定 XML 节点，禁止访问敏感节点）；

- ●避免在 XPath 语句中硬编码敏感信息（如密码、密钥）。

错误示例：动态拼接XPath语句

| // 高危：直接拼接客户端输入，存在 XPath 注入风险String userId = request.getParameter("userId"); // 攻击者可传入：' or '1'='1// 拼接后的 XPath：//user[@id='' or '1'='1']，将查询所有用户信息String xpath = "//user[@id='" + userId + "']";XPathExpression expr = XPathFactory.newInstance().newXPath().compile(xpath);Object result = expr.evaluate(xmlDocument, XPathConstants.NODESET); |
| --- |

正确示例：

| public class SafeXPathExecutor {// 定义参数化的 XPath 模板（使用变量占位符）private static final String XPATH_TEMPLATE = "//user[@id=\$userId]";// 自定义 VariableResolver：传递参数，避免拼接static class CustomVariableResolver implements XPathVariableResolver {private final Map<String, Object> variables;public CustomVariableResolver(Map<String, Object> variables) {this.variables = variables;}@Overridepublic Object resolveVariable(QName qName) {// 仅返回预定义的变量，防止非法变量注入return variables.get(qName.getLocalPart());}}public Document queryUserById(String clientUserId, Document xmlDoc) throws XPathExpressionException {// 第一步：先对客户端输入进行白名单/正则校验（基础防护）if (!clientUserId.matches("^[0-9]{1,6}\$")) { // 仅允许 1-6 位数字throw new IllegalArgumentException("非法用户ID：仅允许 1-6 位数字");}// 第二步：构建参数映射，传递合法参数Map<String, Object> params = new HashMap<>();params.put("userId", clientUserId);// 第三步：创建 XPath 对象并设置参数解析器XPath xpath = XPathFactory.newInstance().newXPath();xpath.setXPathVariableResolver(new CustomVariableResolver(params));// 第四步：编译参数化模板并执行查询（无拼接，无注入风险）XPathExpression expr = xpath.compile(XPATH_TEMPLATE);return (Document) expr.evaluate(xmlDoc, XPathConstants.NODE);}// 测试示例public static void main(String[] args) throws Exception {String xml = "<users><user id='1001'>张三</user><user id='1002'>李四</user></users>";Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new ByteArrayInputStream(xml.getBytes()));SafeXPathExecutor executor = new SafeXPathExecutor();Document user = executor.queryUserById("1001", doc);System.out.println("查询结果：" + user.getTextContent()); // 输出：张三}} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| XPath_Injection | High |
| Potential_XPath_Injection | High |
| Stored_XPath_Injection | High |

- **【强制】** XML 解析器必须禁用 DTD 解析与外部实体引用，防范 XXE 注入攻击析

核心定义与风险说明

- ●风险定义：

XML 外部实体注入（XXE）是指攻击者利用 XML 解析器默认支持 DTD 解析、外部实体引用的特性，构造恶意 XML 数据，读取服务器本地敏感文件（如 /etc/passwd）、内网端口探测、发起 SSRF 攻击、执行远程恶意代码；

- ●核心漏洞点：

DTD（文档类型定义）支持外部实体引用，解析器会自动加载并解析外部文件/远程资源，导致敏感信息泄露；

- ●风险场景：

所有解析用户可控 XML 数据的场景（文件上传、接口参数、配置解析）均存在 XXE 风险。

核心安全规则

- ●强制项

所有 Java XML 解析器（DocumentBuilder、SAXParser、SAXReader、XMLInputFactory、Transformer 等）必须禁用 DTD 解析，完全关闭外部实体加载功能。

- ●安全配置要求

- 1) 优先完全禁用 DTD（最安全，无兼容风险）；

- 2) 若业务必须使用 DTD，必须禁用外部实体，禁止加载外部 DTD、外部参数实体；

- 3) 禁止使用解析器默认配置（默认通常开启 DTD 与外部实体）；

- 4) 解析不可信 XML 数据时，必须同时配置安全解析工厂。

禁止/不推荐的行为

- ✗禁止使用默认配置解析用户上传/外部传入的 XML 数据；

- ✗禁止允许 XML 解析器加载本地文件、远程资源；

- ✗禁止忽略 XML 解析安全配置，仅做业务解析逻辑。

补充安全要求

- ●对所有 XML 解析失败、非法 DTD/外部实体尝试的请求进行日志告警；

- ●优先使用 JSON 等非 XML 格式传输数据，从根源规避 XXE 风险；

- ●第三方 XML 解析库（如 dom4j、jaxb）必须同步配置安全解析参数。

错误示例：使用默认配置解析 XML，存在 XXE 漏洞

| // 高危：默认配置允许 DTD 解析 + 外部实体加载DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();DocumentBuilder builder = factory.newDocumentBuilder();// 解析攻击者构造的恶意 XML，可直接读取服务器敏感文件Document doc = builder.parse(inputStream); |
| --- |

正确示例：

| public static Document getXmlDocument(String xmlObject) {try {// 1. 将 Base64 编码的字符串解码为字节数组，并转为输入流byte[] byteResponse = new Base64().decode(xmlObject.getBytes(StandardCharsets.UTF_8));ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(byteResponse);// 2. 配置 XML 解析器工厂，防御 XXE 攻击documentBuilderFactory.setNamespaceAware(true);// 彻底禁止 DOCTYPE 声明 (最核心的防御)documentBuilderFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);// 禁止外部通用实体documentBuilderFactory.setFeature("http://xml.org/sax/features/external-general-entities", false);// 禁止外部参数实体documentBuilderFactory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);// 禁止加载外部 DTDdocumentBuilderFactory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);// 不扩展实体引用documentBuilderFactory.setExpandEntityReferences(false);// 3. 构建解析器并执行解析DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();return documentBuilder.parse(byteArrayInputStream);} catch (Exception e) {logger.error("getXmlDocument error: ", e);}return null;} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| Potential_XXE_Injection | High |

- **【强制】** 严格校验用户可控的序列化数据，全面防范反序列化漏洞

核心风险定义

当反序列化的输入数据（如网络传输的字节流、文件存储的序列化数据、RPC 调用的参数等）可被用户控制时，攻击者可构造恶意序列化数据，通过 ObjectInputStream.readObject()、ObjectInputStream.readUnshared() 等方法触发非预期的类实例化或代码执行（如通过重写 readObject() 方法注入恶意逻辑），导致远程代码执行（RCE）、数据泄露等严重安全问题。

核心防护措施

- ●首选方案：避免使用 Java 原生序列化

- 1) 替换为安全的序列化协议：优先使用 JSON（Jackson/Gson）、Protobuf、Thrift 等结构化数据格式，完全摒弃 Java 原生序列化（Serializable/Externalizable）；

- 2) 若为 RPC 调用：使用 gRPC、REST API（JSON）替代 RMI、Hessian、Dubbo 原生序列化（Dubbo 建议切换为 Protobuf 序列化方式）。

- ●次选方案：强制校验序列化数据（必须用户可控时）

- 1) 白名单校验类名：自定义 ObjectInputStream 子类，重写 resolveClass() 方法，仅允许预定义的白名单类被反序列化（禁止反序列化 ClassLoader、ProcessBuilder、Runtime 等高风险类）；

- 2) 校验数据完整性：对序列化数据添加强签名（如 HMAC-SHA256），服务端先验证签名合法性，再执行反序列化（签名密钥需安全存储，禁止硬编码）；

- 3) 限制反序列化权限：使用 SecurityManager 或自定义类加载器，限制反序列化过程中的类加载和代码执行权限（如禁止执行系统命令、读写敏感文件）；

- 4) 禁用危险类的反序列化：通过 JVM 参数（jdk.serialFilter）或代码配置全局序列化过滤器，拒绝反序列化高风险类（如 java.lang.Process、java.lang.Runtime、org.apache.commons.collections.Transformer 等）。

- ●兜底要求：安全重写 readObject 方法（仅自定义序列化类）

若业务必须实现 Serializable 接口，需在自定义类中重写 readObject() 方法：

- 1) 校验对象字段的合法性（如数值范围、字符串格式）；

- 2) 禁止在 readObject() 中执行敏感操作（如调用系统命令、修改文件）；

- 3) 避免反序列化不可信的嵌套对象。

禁止/不推荐的行为

- ✗禁止直接反序列化用户可控的字节流：严禁调用 new ObjectInputStream(inputStream).readObject() 处理未校验的用户输入；

- ✗禁止仅依赖 “黑名单校验类名”：黑名单易遗漏新型高风险类，且攻击者可通过类继承、反序列化链绕过；

- ✗禁止使用存在反序列化漏洞的老旧库：如 Apache Commons Collections < 3.2.2、Fastjson < 1.2.83 等，此类库的默认反序列化逻辑可被轻易利用；

- ✗禁止将序列化数据存储在客户端可修改的位置（如 Cookie、LocalStorage），或通过 URL 参数传递序列化字节流。

补充安全要求

- ●序列化数据加密传输：若必须传输序列化数据，需通过 HTTPS/TLS 加密，防止数据被篡改或窃取；

- ●日志审计：记录反序列化操作的关键信息（如请求 IP、序列化类名、数据来源），校验失败时立即告警；

- ●依赖治理：定期扫描项目依赖，移除存在反序列化漏洞的第三方库，及时升级至安全版本；

- ●JVM 层面防护：Java 9+ 可配置 jdk.serialFilter 系统属性，全局限制反序列化的类范围（如 jdk.serialFilter=java.base/*;java.util/*;!*）。

错误示例：

| //读取输入流,并转换对象InputStream in=request.getInputStream();ObjectInputStream ois = new ObjectInputStream(in);//恢复对象ois.readObject();ois.close(); |
| --- |

正确示例：校验类名

| import java.io.*;import java.util.Objects;public class StandardSafeDeserializer {private static final String SERIALIZATION_FILTER_PATTERN =// 1. 允许业务包下的所有类（** 代表包下任意层级子类，彻底解决嵌套对象问题）"com.example.business.**;" +// 2. 允许 Java 基础集合类的【具体实现类】（绝对不能写接口）"java.util.ArrayList;" +"java.util.LinkedList;" +"java.util.HashMap;" +"java.util.LinkedHashMap;" +"java.util.HashSet;" +// 3. 允许基础类型包装类和常用类"java.lang.String;" +"java.lang.Integer;" +"java.lang.Long;" +"java.lang.Boolean;" +"java.lang.Double;" +"java.util.Date;" +// 4. 【极其重要】允许所有基本类型数组（以 [ 开头的描述符）// 否则只要对象里包含 int[] 或 String[]，就会反序列化失败"[*;" +// 5. 兜底规则：拒绝其他所有未明确允许的类（!* 表示拒绝）"!*";/*** 安全的反序列化方法*/public static Object safeDeserialize(InputStream inputStream) throws IOException, ClassNotFoundException {Objects.requireNonNull(inputStream, "输入流不能为空");// 使用原生的 ObjectInputStream，不要再去继承和重写它try (ObjectInputStream ois = new ObjectInputStream(inputStream)) {// 创建并绑定 ObjectInputFilterObjectInputFilter filter = ObjectInputFilter.Config.createFilter(SERIALIZATION_FILTER_PATTERN);ois.setObjectInputFilter(filter);// 执行反序列化。如果流中包含恶意 Gadget 链（如 org.apache.commons.collections.functors.InvokerTransformer），// 它不在上述白名单中，会在底层直接抛出 InvalidClassException 被拦截。return ois.readObject();} catch (InvalidClassException e) {System.err.println("[安全告警] 拦截到非法反序列化请求: " + e.getMessage());throw e;}}} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| Deserialization_of_Untrusted_Data | High |
| Deserialization_of_Untrusted_Data_in_JMS | High |

- **【强制】** 严禁将不可信输入注入表达式/模板引擎，必须严格过滤与隔离

核心定义与风险说明

- ●风险定义：表达式/模板注入是指将用户可控的不可信数据（请求参数、表单内容、外部数据）直接拼接到视图模板、表达式语言、动态脚本中，被引擎解析执行，导致任意代码执行、文件读写、命令执行、数据泄露等高危漏洞；

- ●高危场景：JSP/EL 表达式、Thymeleaf、FreeMarker、Velocity、OGNL、SpEL、OGNL、JEXL、动态 SQL 模板、动态日志模板等；

- ●核心危害：攻击者可构造恶意表达式（如 \${1+1}、\${T(java.lang.Runtime).exec('calc')}）实现服务器层面入侵。

核心安全规则

- ●首选方案：数据与模板完全分离

模板使用固定、预定义、不可篡改的内容，用户数据仅作为变量参数传入，不参与模板结构；

- ●次选方案：严格白名单校验

若必须使用用户输入构建表达式，仅允许字母、数字、下划线等安全字符，彻底禁止 \${ } #{ } <%= %> @ () 等表达式符号；

- ●兜底方案：禁用/沙箱模式

关闭表达式解析功能，或使用沙箱、安全管理器、白名单类加载限制表达式执行权限。

禁止/不推荐的行为

- ✗禁止将用户输入直接传入 getValue(value)、executeExpression()、processTemplate() 等执行方法；

- ✗禁止使用字符串拼接动态生成 EL、SpEL、OGNL 表达式；

- ✗禁止在生产环境开启表达式自动解析、自动求值功能；

- ✗禁止使用黑名单过滤（仅过滤 script 等关键词极易被绕过）。

补充安全要求

- ●对包含表达式特征的输入进行拦截、日志记录、告警；

- ●模板引擎/表达式引擎使用最新稳定版本，及时修复已知漏洞；

- ●敏感场景（如内容管理、富文本、自定义配置）默认关闭表达式解析。

错误示例：直接将用户输入拼接到表达式/模板中

| // 高危：用户输入直接作为 SpEL 表达式执行，可远程代码执行String userInput = request.getParameter("input"); // 攻击者传入 T(Runtime).getRuntime().exec("calc")ExpressionParser parser = new SpelExpressionParser();Expression exp = parser.parseExpression(userInput); // 直接解析用户输入，严重漏洞Object result = exp.getValue();// 高危：EL 表达式注入，直接拼接用户输入到 JSP 表达式String username = request.getParameter("username");String jspCode = "<%= " + username + " %>"; // 可注入恶意代码 |
| --- |

正确示例：

| import org.springframework.expression.Expression;import org.springframework.expression.spel.standard.SpelExpressionParser;import org.springframework.expression.spel.support.SimpleEvaluationContext;public class SafeExpressionUtil {private static final SpelExpressionParser parser = new SpelExpressionParser();/*** 不清洗用户输入，而是限制执行环境的权限* 假设用户传入的是动态的属性名，比如 "name", "age"*/public static Object evaluateSafe(String userProvidedPath, Object rootObject) {// 1. 构建绝对安全的沙箱环境：只读、只能绑定数据、不能调用Java方法/类SimpleEvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().withRootObject(rootObject).build();try {// 2. 直接解析用户输入。即便攻击者传入 "T(Runtime).exec()"// 在 SimpleEvaluationContext 下也会直接抛出异常，根本无法执行。Expression expression = parser.parseExpression(userProvidedPath);return expression.getValue(context);} catch (Exception e) {throw new IllegalArgumentException("非法的表达式路径或无权访问");}}} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| Expression_Language_Injection_OGNL | High |
| Expression_Language_Injection_SPEL | High |

- **【强制】** 服务端执行操作系统命令的安全约束

核心定义与风险说明

- ●风险定义

服务端直接使用客户端输入拼接或执行操作系统命令，会导致命令注入漏洞。攻击者可通过构造特殊字符（如 ; & | > \$ ' 等）注入恶意命令，实现服务器接管、文件读取、账号窃取、内网穿透等高危入侵行为；

- ●防护目标

严格约束服务端命令执行逻辑，杜绝外部输入控制命令内容，从根源上避免命令注入风险。

2、核心安全规则

- ●必须使用白名单校验

仅允许预定义合法值，不允许任意字符输入；

- ●正则严格限制字符范围

仅允许字母、数字、下划线等安全字符，禁止出现 ; & | < > ( ) { } \$ ' " \\ 空格、换行符等注入字符；

- ●尽量不使用客户端参数作为命令入参

尽量使用固定命令、枚举值、后端配置参数，减少外部输入。

3、禁止/不推荐的行为

- ✗禁止将客户端输入直接拼接到命令字符串；

- ✗禁止使用 Runtime.exec 传递拼接后的命令；

- ✗禁止不对参数做白名单 / 正则校验直接使用；

- ✗禁止使用高权限账号执行外部命令；

- ✗禁止能使用 Java API 实现却调用系统命令。

4、补充安全要求

- ●执行命令的服务端进程需遵循最小权限原则，仅赋予完成业务所需的最低操作系统权限（如禁止以 root/Administrator 权限执行）；

- ●禁止执行无明确业务必要的操作系统命令，尽量通过纯 Java 代码实现功能（如文件操作优先使用 JDK 内置 API，而非 ls/cmd dir 命令）。

错误示例：

| // 严重违规：从客户端获取完整命令String clientCmd = request.getParameter("cmd"); // 客户端传入如 "ls; rm -rf /"Runtime.getRuntime().exec(clientCmd); // 命令注入风险// 高危：拼接客户端参数（参数含 "; rm -rf /" 则触发注入）String clientParam = request.getParameter("file");Runtime.getRuntime().exec("cat " + clientParam); |
| --- |

正确示例：白名单 + ProcessBuilder 参数传递

| import java.util.Arrays;import java.util.HashSet;import java.util.Set;public class SafeCmdExecutor {private static final Set<String> ALLOWED_FILES = new HashSet<>(Arrays.asList("config.txt", "log.txt"));private static final String PARAM_REGEX = "^[a-zA-Z0-9_.]+\$";public void executeSafeCmd(String clientParam) {// 第一步：白名单校验（绝对拦截）if (!ALLOWED_FILES.contains(clientParam)) {throw new IllegalArgumentException("非法参数：仅允许访问 " + ALLOWED_FILES);}// 第二步：正则二次校验（纵深防御）if (!clientParam.matches(PARAM_REGEX)) {throw new IllegalArgumentException("参数格式非法：仅允许字母、数字、下划线、点");}ProcessBuilder pb = new ProcessBuilder("cat", clientParam);try {Process process = pb.start();int exitCode = process.waitFor();// 日志记录：建议使用 SLF4J 等日志框架，此处简化为 System.outSystem.out.println("命令执行完成，参数：" + clientParam + "，退出码：" + exitCode);} catch (Exception e) {// 异常处理：包装异常，避免将系统内部的堆栈或路径信息直接抛给前端throw new RuntimeException("命令执行失败", e);}}} |
| --- |

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| Command_Injection | High |
| Stored_Command_Injection | High |
| Command_Argument_Injection | High |
| Stored_Command_Argument_Injection | High |
| Potential_Command_Injection | High |

- **【强制】** 对客户端表单/接口请求实施 CSRF 防护，严格校验请求合法性

核心定义与风险说明

- ●风险定义：

攻击者利用用户已认证的会话凭证（如 Cookie），诱导用户在受信任的 Web 应用中执行非本意的操作（如转账、修改密码、提交表单）；

- ●防护目标：

所有状态变更类请求（POST/PUT/DELETE 等）必须实施 CSRF 防护，GET 请求禁止用于执行状态变更操作（如修改数据、提交订单），从源头降低 CSRF 风险。

核心安全规则

- ●首选方案：基于 Token 的 CSRF 防护（行业标准方案）

- 1) 生成规则：服务端为每个用户会话生成唯一、不可预测的 CSRF Token（建议长度 ≥ 16 位随机字符串，结合会话 ID + 随机数 + 时间戳哈希生成）；

- 2) 传递方式：

- a. 表单场景：将 Token 嵌入表单隐藏域（<input type="hidden" name="csrfToken" value="xxx">）；

- b. AJAX 请求：将 Token 放入请求头（如 X-CSRF-Token: xxx），禁止通过 URL 参数传递（易被泄露）；

- 3) 校验规则：服务端接收请求时，校验 Token 是否存在、是否与当前会话绑定的 Token 一致，不一致则拒绝请求；

- 4) 安全要求：Token 需设置有效期（如 30 分钟），会话失效/用户登出时立即失效，且禁止跨域传递。

- ●补充防护（双重保障）：

- 1) 验证请求源：校验 Origin/Referer 请求头（优先校验 Origin，无则校验 Referer），仅允许白名单内的域名（如本应用域名）发起请求；

- 2) 敏感操作二次验证：对转账、修改密码等高危操作，除 CSRF Token 外，增加验证码、短信验证、密码二次校验等；

- 3) 遵循 SameSite Cookie 规则：为会话 Cookie 设置 SameSite=Strict/Lax 属性，禁止第三方网站携带本应用 Cookie 发起请求（Java Web 可通过 Cookie.setSameSite() 或容器配置实现）。

- ●框架集成建议：

- 1) Spring Boot/Spring Security：直接启用内置 CSRF 防护（默认开启），自动生成/校验 Token，无需手动实现；

- 2) 原生 Servlet：封装 CSRF Token 生成、存储（HttpSession）、校验工具类，统一拦截校验。

禁止/不推荐的行为

- ✗禁止仅依赖 Referer 头校验（Referer 可被部分浏览器/插件篡改或隐藏）；

- ✗禁止使用固定 Token（如全站统一 Token、用户固定 Token），易被窃取复用；

- ✗禁止忽略非表单请求（如 AJAX POST、REST API），此类请求同样存在 CSRF 风险；

- ✗禁止将 CSRF Token 存储在 localStorage/sessionStorage 中并通过 JS 读取（易被 XSS 攻击窃取），需绑定到服务端会话。

补充安全要求

- ●对所有 CSRF 校验失败的请求进行日志记录（包含请求 IP、URL、Token 信息），便于攻击追溯；

- ●移动端/API 接口：若为前后端分离/APP 场景，优先使用 OAuth2.0、JWT（需包含不可预测的 nonce 参数）等认证方式，替代 Cookie 会话认证，从根源规避 CSRF；

- ●禁止将敏感操作通过 GET 请求实现（如 GET /transfer?to=123&amount=1000），GET 请求易被构造为恶意链接、图片标签（<img src="http://bank.com/transfer?to=123&amount=1000">）触发。

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| Cross_Site_History_Manipulation | Medium |

- **【强制】** 全场景禁止弱口令，强制密码复杂度与弱口令检测

核心定义与风险说明

- ●弱口令风险：弱口令是导致未授权访问、数据泄露、服务器入侵、 ransomware 攻击、内网横向渗透的最主要入口之一。

- ●覆盖范围：所有需要身份认证的组件、账户、服务均必须遵守，禁止任何组件、环境使用弱口令。

强制密码复杂度要求（必须同时满足）

- ●长度要求

密码长度 ≥ 12 位 （重要系统/管理后台建议 ≥ 16 位）。

- ●组合复杂度

必须包含以下4 类中的至少 3 类：

- 1) 大写英文字母（A-Z）

- 2) 小写英文字母（a-z）

- 3) 数字（0-9）

- 4) 特殊字符（如 !@#\$%^&*()_+-=[]{}|;:,.<>?）

- ●禁止使用的密码类型

- 1) 禁止使用连续/重复字符：如 123456、aaaaaa、111222；

- 2) 禁止使用常见字典词：如 password、admin、root、test；

- 3) 禁止使用企业/产品/项目相关公开信息：如公司名、域名、产品名、年份、版本号拼接（如 yonyou@1988、admin@123）；

- 4) 禁止使用个人信息：用户名、手机号、身份证号、生日等；

- 5) 禁止使用历史公开泄露库中的密码

强制检查范围（全覆盖）

所有系统、组件、配置文件、发布包、镜像、脚本内的口令必须检查：

- ✗应用系统用户密码（前台用户、后台管理员）

- ✗服务器 OS 账号（Linux/Windows）

- ✗中间件：Tomcat、Jetty、Nginx、WebLogic、WebSphere 等

- ✗数据库：MySQL、Oracle、PostgreSQL、MongoDB、Redis 等

- ✗缓存/消息队列：Redis、Kafka、RabbitMQ、RocketMQ

- ✗注册配置中心：Nacos、Zookeeper、Eureka、Consul

- ✗监控、定时任务、运维平台、跳板机、CI/CD 平台

- ✗配置文件、properties、yml、xml、启动脚本、Docker 镜像、安装包

禁止/不推荐的行为

- ✗禁止使用默认密码、示例密码、测试密码上线；

- ✗禁止多系统/多组件共用同一密码；

- ✗禁止仅校验长度与简单组合，不做弱口令字典匹配；

- ✗禁止将密码通过日志、接口返回、异常信息泄露。

安全实现要求

- ●必须内置弱口令字典校验

系统必须集成弱口令检测逻辑，使用官方/行业标准弱口令字典，不依赖单纯复杂度规则。

- ●强制密码哈希存储

禁止明文、Base64、简单 MD5/SHA1 存储密码；

必须使用慢哈希算法：BCrypt、Argon2id、PBKDF2WithHmacSHA256。

- ●强制密码策略

- 1) 新用户注册/密码修改时必须校验复杂度与弱口令；

- 2) 管理员密码必须更高强度（≥16 位、4 类字符组合）；

- 3) 支持密码历史重复限制（禁止最近 3~5 次使用过的密码）；

- 4) 支持定期强制修改（90 天）。

- ●禁止硬编码口令

严禁在代码、配置文件、镜像、脚本中硬编码固定密码，必须使用配置中心、密钥管理服务（KMS）、环境变量注入。

对应CheckMarx规则：

| 漏洞类型 | 风险等级 |
| --- | --- |
| 无 | 无 |`
  },
{
    id: "arch-3",
    module: "架构殿堂",
    category: "性能驿站",
    title: "BIP基础硬件环境要求",
    summary: "系统的高效运行离不开底层硬件的支撑，为您梳理 BIP 在不同业务规模下的硬件配置建议。",
    content: `重要说明：以下硬件配置为所有性能测试的基础前提条件，适用于单点性能测试和百人在线端到端性能测试场景。大数据场景需单独评估硬件资源，不直接使用本配置。

**全栈信创标准**：现有单点性能标准的150%，信创客户端建议配置：麒麟9006C/海光C86-3250/鲲鹏920，360安全浏览器（Chromium132内核）/奇安信可信浏览器（Chromium132内核）

**全栈信创标准**：部署资源在原标准值调整为cpu * 2，内存 * 1.5，xmx * 1.3配置

---

## 1.1 服务器端基础硬件要求及部署模式
说明：BIP研发环境测试结果均为普通标准值，部署模式：服务器部署模式

### 1.1.1 业务资源池

| 主机IP | 测试类型 | 主机参数 | 指标名称 | 达标值 | 优秀值 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 业务资源池 | 主机 3台 | CPU核数: 32<br>CPU主频: 2.10 GHz<br>CPU架构: x86_64 | CPU每秒事件数 | 3000 | 4500 |
| | | | CPU延迟平均(ms) | 2 | 1 |
| | | | CPU延迟P95(ms) | 3 | 1 |
| | | | 内存随机写带宽(MiB/sec) | 1000 | 2000 |
| | | | 内存随机写平均延迟(ms) | 2 | 1 |
| | | | 内存随机写延迟P95(ms) | 3 | 1 |
| | | | 磁盘随机读吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机写吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机读IOPS | 8000 | 10000 |
| | | | 磁盘随机写IOPS | 8000 | 10000 |
| | 带宽 | - | 带宽MB/sec | 100 | 1000 |

### 1.1.2 平台资源池

| 主机IP | 测试类型 | 主机参数 | 指标名称 | 达标值 | 优秀值 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 平台资源池 | 主机 1台 | CPU核数: 32<br>CPU主频: 2.40 GHz<br>CPU架构: x86_64 | CPU每秒事件数 | 3000 | 4500 |
| | | | CPU延迟平均(ms) | 2 | 1 |
| | | | CPU延迟P95(ms) | 3 | 1 |
| | | | 内存随机写带宽(MiB/sec) | 1000 | 2000 |
| | | | 内存随机写平均延迟(ms) | 2 | 1 |
| | | | 内存随机写延迟P95(ms) | 3 | 1 |
| | | | 磁盘随机读吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机写吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机读IOPS | 8000 | 10000 |
| | | | 磁盘随机写IOPS | 8000 | 10000 |
| | 带宽 | - | 带宽MB/sec | 100 | 1000 |

### 1.1.3 中间件服务器

| 主机IP | 测试类型 | 主机参数 | 指标名称 | 达标值 | 优秀值 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 中间件服务器 | 主机 1台 | CPU核数: 32<br>CPU主频: 2.40 GHz<br>CPU架构: x86_64 | CPU每秒事件数 | 3000 | 4500 |
| | | | CPU延迟平均(ms) | 2 | 1 |
| | | | CPU延迟P95(ms) | 3 | 1 |
| | | | 内存随机写带宽(MiB/sec) | 1000 | 2000 |
| | | | 内存随机写平均延迟(ms) | 2 | 1 |
| | | | 内存随机写延迟P95(ms) | 3 | 1 |
| | | | 磁盘随机读吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机写吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机读IOPS | 8000 | 10000 |
| | | | 磁盘随机写IOPS | 8000 | 10000 |
| | 带宽 | - | 带宽MB/sec | 100 | 1000 |
| | DB client | mysql @ 172.20.37.232:3306/testdb | 每秒事务数 | 300 | 1000 |
| | | | 每秒查询数 | 7000 | 30000 |
| | | | 平均延迟 (ms) | 100 | 20 |
| | | | 95%分位延迟 (ms) | 100 | 20 |
| | Redis | Redis 地址: 172.20.38.231:6890 | 最大连接数 | 40000 | 80000 |
| | | | SET 吞吐量 (请求/秒) | 50000 | 100000 |
| | | | SET平均延迟 (ms) | 1 | 0.5 |
| | | | SET最小延迟 (ms) | 0.2 | 0.1 |
| | | | SET最大延迟 (ms) | 15 | 5 |
| | | | GET 吞吐量 (请求/秒) | 50000 | 100000 |
| | | | GET平均延迟 (ms) | 1 | 0.5 |
| | | | GET最小延迟 (ms) | 0.2 | 0.1 |
| | | | GET最大延迟 (ms) | 15 | 5 |
| | | | CPU 平均使用率 (%) | 55 | 50 |
| | Kafka | 主题: topic_benchmark_test<br>服务器: 172.20.38.231:6876<br>记录数: 500000, 大小: 1000B | 生产方吞吐量 (records/sec) | 60000 | 200000 |
| | | | 生产方带宽 (MB/sec) | 60 | 200 |
| | | | 生产方平均延迟 (ms) | 400 | 10 |
| | | | 生产方最大延迟 (ms) | 1000 | 500 |
| | | | 消费方吞吐量 (nMsg/sec) | 20000 | 27000 |
| | | | 消费方带宽 (MB/sec) | 20 | 25 |
| | | | 消费方fetch吞吐量 (nMsg/sec) | 150000 | 300000 |
| | | | 消费方fetch带宽 (MB/sec) | 150 | 300 |
| | Opensearch | Workload: yonyou_osb_workload<br>Pipeline: benchmark-only | 索引平均写入性能（docs/sec） | 50000 | 60000 |
| | | | 索引写入延迟(P50ms) | 1500 | 1000 |
| | | | 索引写入延迟(P90ms) | 1500 | 1000 |
| | | | 平均查询性能(ops/sec) | 50 | 300 |
| | | | 查询延迟 | 50 | 25 |
| | | | Young GC性能(sec) | 10 | 5 |
| | | | Old GC性能(sec) | 10 | 5 |

### 1.1.4 数据库服务器

| 主机IP | 测试类型 | 主机参数 | 指标名称 | 达标值 | 优秀值 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 数据库 (MySQL) | 主机 1台 | CPU核数: 32<br>CPU主频: 2.10 GHz<br>CPU架构: x86_64 | CPU每秒事件数 | 3000 | 4500 |
| | | | CPU延迟平均(ms) | 2 | 1 |
| | | | CPU延迟P95(ms) | 3 | 1 |
| | | | 内存随机写带宽(MiB/sec) | 1000 | 2000 |
| | | | 内存随机写平均延迟(ms) | 2 | 1 |
| | | | 内存随机写延迟P95(ms) | 3 | 1 |
| | | | 磁盘随机读吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机写吞吐量(MB/sec) | 90 | 180 |
| | | | 磁盘随机读IOPS | 8000 | 10000 |
| | | | 磁盘随机写IOPS | 8000 | 10000 |
| | 带宽 | - | 带宽MB/sec | 100 | 1000 |

### 1.1.5 操作系统、Nginx、Redis、数据库优化参数
说明：参见《BIP系统标准参数配置》，本文略

### 1.1.6 海外网络环境标准
说明：以下标准为海外访问场景的标准，适用于跨国部署、海外数据中心访问国内系统、或国内用户访问海外节点等场景。

#### 网络基线标准

| 场景 | 网络延迟(RTT) | 带宽要求 | 丢包率 | 适用地区示例 |
| :--- | :--- | :--- | :--- | :--- |
| 国内标准环境 | ≤5ms | ≥100MB/s | ≤0.1% | 中国大陆同城双活 |
| 亚太地区-达标 | 100ms | ≥50MB/s | ≤1% | 香港、新加坡、日本、韩国 |
| 亚太地区-优秀 | 50ms | ≥100MB/s | ≤0.5% | 香港、新加坡、日本、韩国 |
| 欧美地区-达标 | 250ms | ≥30MB/s | ≤2% | 美国、英国、德国、法国 |
| 欧美地区-优秀 | 150ms | ≥50MB/s | ≤1% | 美国、英国、德国、法国 |
| 全球偏远地区-达标 | 500ms | ≥10MB/s | ≤3% | 南美、非洲、中东部分地区 |
| 全球偏远地区-优秀 | 300ms | ≥20MB/s | ≤2% | 南美、非洲、中东部分地区 |`
  },
{
    id: "arch-4",
    module: "架构殿堂",
    category: "AI解惑",
    title: "BIP业务对象是什么？",
    summary: "业务对象是BIP平台数字化建模的基石，本文从本质、构造、应用场景和上手方法四个维度，为新接触者详解这一核心概念",
    content: `前言：为什么你必须搞懂"业务对象"

踏入用友BIP技术世界的第一天，你可能会被一连串陌生的概念砸得有些发懵——元数据、实体、单据类型、UI模板、业务流、规则链……它们彼此交织，仿佛一张密不透风的网。然而，只要找准一个核心支点，整张网就能被轻松拎起。这个支点，就是业务对象（Business Object）。

无论是配置一张销售订单的业务流，还是在YonBuilder里做字段扩展，抑或是排查两张单据之间无法生单的原因——你几乎都会和业务对象打交道。毫不夸张地说，理解业务对象，是打开BIP数字化大门的第一把钥匙。

本文将结合专家资料与新人视角，从"是什么""由什么构成""能做什么""怎么上手"四个维度，带你彻底搞懂业务对象。

一、业务对象的本质：一个"活"的数字实体

从现实世界到数字世界

什么是业务对象？通俗地讲，业务对象是对现实世界中各类业务实体、业务规则的数字化抽象与封装。换句话说，企业经营中接触到的每一个"东西"——客户、订单、产品、供应商、员工——在BIP系统中都对应着一个业务对象。

但业务对象绝非简单的"一张数据库表"。根据《iuap元数据及业务对象红皮书》的定义，业务对象是"以一个元数据实体作为主实体的聚合实体"，它内部封装了：

- 数据模型：描述业务对象的结构与属性；

- 业务规范：字段校验规则、唯一性规则、必输规则等；

- 访问方式：支撑服务的接入与调用接口。

正是这种"数据+规范+行为"的三位一体封装，让业务对象从一个静态的数据载体，变成了一个可感知、可交互、可流转的**"活"的数字实体**。

业务对象与元数据：剪不断的关系

初学者很容易把业务对象和元数据（Metadata）混为一谈。简单区分：元数据是描述数据的数据，是BIP平台的底层骨架；业务对象是元数据的能力扩展，是面向业务场景的上层封装。

打个比方：如果把BIP系统比作一座大楼，元数据就是钢筋、水泥、砖块等建材，而业务对象则是按照施工图纸预制好的预制件——它由建材组成，但已经有了特定的功能和形状，可以直接拿来搭建特定的应用场景。

在技术架构层面，元数据采用两级分层设计：

| 层级 | 说明 |
| --- | --- |
| 标准元数据 | 领域内通用业务模型，由用友原厂提供 |
| 个性化元数据 | 按租户维度的个性化扩展，支持在原厂基础上新增属性或覆盖配置 |

这种分层设计保证了标准能力与个性化需求之间的平衡——企业可以在不修改原厂标准的前提下，通过租户级扩展满足自身业务需求。

二、业务对象的内部构造：四个关键要素

一个完整的业务对象，由以下四个核心要素构成。理解它们，就理解了整个BIP平台建模逻辑的半壁江山。

# 1. 属性：业务的"五官"

属性是业务对象承载的静态数据，描述业务实体的特征。以"采购订单"业务对象为例，它的属性可能包括"供应商""采购组织""币种""税率""收货日期"等。

属性并非简单的字段列表。在BIP体系中，属性的元数据信息极为丰富：

- 数据类型：文本、数值、日期、枚举、参照等；

- 展示属性：字段在前端页面的展示顺序、是否必输、控件类型；

- 业务规则：唯一性规则、非空规则、日期格式、默认值等；

- 场景标记：标记该属性支持哪些支撑服务（如报表、数据权限、字段权限）。

提示：属性的场景标记非常关键——只有标记了【报表】场景，语义模型才能加载到该字段；标记了【数据权限】，权限引擎才能对该字段进行权限控制。

# 2. 实体与数据模型：业务的"骨架"

业务对象的数据模型由实体（Entity）构成。一个业务对象包含一个主实体，以及主实体下的子实体、平行实体（子表或平行表）。以采购订单为例，其数据模型结构如下：

关于实体与物理表的关系，需要记住以下原则：

- 一个业务对象 有且只有一个主实体；

- 一个业务对象可对应多个物理表（主子表结构），也可以多个业务对象共用一个物理表（多UI模板场景）；

- 实体与物理表的实现关系包括 1:1、1:N、N:1 三种，系统中只能指定其中一种。

# 3. 关联关系：业务的"神经网络"

企业业务从来不是孤立运转的——销售订单生成发货单，发货单生成销售发票，发票关联收款核销……业务对象之间通过关联关系编织成一张紧密的语义网络。

BIP中的关联关系主要分为两类：

第一类：单据间的上下游关联（生单链路）通过生单规则和转换规则实现。例如：

销售订单 → 发货单 → 销售出库单 → 销售发票

在这条链路上，上游单据的数据可以自动穿透填充到下游单据，系统预设了大量标准转换规则，实施时只需微调参数即可。

第二类：基础档案间的参照关联例如"业务伙伴"与"客户"的关联管理、"物料"与"产品"的分类关联配置等。这类关系通过外键关联属性实现底层绑定，确保数据在不同模块之间的一致性。

# 4. 规则链：业务的"行为逻辑"

如果说属性和实体描述了业务对象"是什么"，那么规则链定义的就是业务对象"做什么"。

规则链是挂在业务对象特定触发时机上的操作序列，常见类型包括：

| 规则类型 | 触发时机 | 作用 |
| --- | --- | --- |
| 字段校验规则 | 保存前 | 检查字段合法性，如金额不能为负数 |
| 唯一性规则 | 保存时 | 确保关键字段值不重复，如订单编号唯一 |
| 非空规则 | 保存时 | 确保必输字段有值 |
| 回写规则 | 审核后 | 自动更新关联单据的状态或数量 |
| 关联规则 | 增删改时 | 同步处理上下游单据的数据一致性 |

当一张单据经历创建、修改、审核、作废等生命周期时，对应规则链上的规则会按预设顺序依次执行，实现业务逻辑的自动化。

三、业务对象能做什么：三大核心应用场景

场景一：配置业务流，实现单据间的自动联动

业务流是BIP平台流程自动化的核心能力。配置业务流时，第一步就是选择业务对象——系统会基于业务对象的关联关系自动展示可关联的下游单据，你只需配置转换规则和分单策略。

例如，配置"销售出库单"转"采购入库单"的标准业务流时，系统已经预设了两个业务对象之间的字段映射，实施人员只需调整参数就能上线，全程零代码。

场景二：使用业务对象设计器，灵活管理元数据

业务对象设计器是BIP平台提供的可视化配置工具。产品经理、实施顾问可以通过设计器完成以下操作：

- 查看：浏览当前租户内所有领域的业务对象及其数据模型；

- 改名：对业务对象、实体、属性的名称进行调整；

- 勾选场景：指定业务对象支持的支撑服务（打印、报表、编码规则、审批流、业务流等）；

- 配置参照与格式化：调整字段的前端交互行为。

新人提示：实体和属性改名时，需要同步通知开发修改对应的XML文件，否则开发通过XML修改时会覆盖设计器中的改动。

场景三：基于业务对象做个性化扩展

当企业的个性化需求无法通过标准配置满足时，业务对象提供了灵活的扩展机制：

- 新增自定义字段：通过YonBuilder在原厂实体上扩展新属性；

- 调整关联规则：修改上下游单据之间的数据同步逻辑；

- 配置自定义项：对于原厂支持自定义项的单据，租户可重新定义预留字段的名称和类型。

所有扩展都在租户级个性化元数据中完成，不触碰原厂标准，完美兼顾个性化与可升级性。

四、新人上手：从这里开始你的第一步

从高频核心单据入手

不要试图一次性搞懂所有业务对象。建议从使用频率最高的几个核心单据入手：

| 单据类型 | 所属领域 | 建议理由 |
| --- | --- | --- |
| 销售订单 | 供应链 | 业务流生单链路最完整，关联关系最典型 |
| 发货单 | 供应链 | 上下游关联丰富，利于理解数据流转 |
| 采购发票 | 财务 | 财务领域入门首选，与总账关联清晰 |

先把这几张单据的标准字段、预置关联关系和规则链搞清楚，再逐步扩展到其他业务对象，事半功倍。

记住一个核心原则：优先复用，慎做客开

BIP预置了大量标准业务对象和关联规则，实施阶段优先通过配置满足需求，非必要不做客开修改。原因很简单：客开代码会增加后续版本升级的兼容风险，而标准配置的改造成本远低于代码改造。

常见问题排查思路

碰到单据生单失败、字段不显示、规则不生效等问题时，标准排查路径是：

- 检查对应业务对象的元数据配置是否正确；

- 检查该字段/业务对象是否勾选了相关场景；

- 检查关联规则链是否正确配置并启用了；

- 检查该字段是否为租户级扩展字段，是否存在与原厂的命名冲突。

结语

业务对象，是BIP平台数字化建模体系的基石，也是每一位BIP技术人必须掌握的第一个核心概念。

它以元数据为骨架，以属性为血肉，以关联关系为经脉，以规则链为行为逻辑——共同构建起企业数字化运营的智能躯体。当你在BIP的世界里越走越深，你会发现：那些曾经让你眼花缭乱的概念，都会一一落回到业务对象的框架之中。

愿本文成为你探索BIP旅程的良好起点。如果在实践中遇到业务对象相关的具体问题，欢迎在期刊评论区留言交流——我们下期见。

参考来源

- 《【场景级模版】DM-04-010 业务对象（YonBIP＆YonSuite）》

- 《业务对象说明》

- 《iuap元数据及业务对象红皮书》

- AI辅助创作素材：业务对象知识本体`
  },
{
    id: "ai-1",
    module: "AI天空",
    category: "Harness修炼手册",
    title: "（转载）Harness Engineering，AI时代的新软件工程",
    summary: "当AI智能体走进生产环境，Harness Engineering成为让AI可控、可维护、可持续演进的系统性方法论。本文深入解析Harness Engineering的核心理念，并提供可落地的实战指南",
    content: `原创 **苏格拉底** **吾知吾行** 2026年3月20日 11:33 浙江

> **摘要**：当AI智能体走进生产环境，Harness Engineering成为让AI可控、可维护、可持续演进的系统性方法论。本文深入解析Harness Engineering的核心理念，并提供可落地的实战指南。

![Header Image](https://img.xiumi.us/xmi/ua/1zZWL/i/cab8bedfcb4796a760c041ea5405d245-sz_267123.jpg?x-oss-process=style/xm)

## 01 | 什么是 Harness Engineering？

如果你正在将 AI 智能体引入生产环境，可能已经遇到了这些问题：

- Agent 今天能完成任务，明天却莫名其妙失败；
- 同一个提示词，换了个模型就完全不可用；
- 测试用例写了一堆，但每次改提示词都要手动回归……

**这些问题的根源，不在于模型能力，而在于缺少一套工程化的"套马索"——Harness Engineering。**

Harness（套马索）这个词源于驯马——你再厉害的骏马，也需要缰绳、马鞍、马镫这套 harness 系统，才能 safely 为人所用。AI 模型也是如此。

> 📌 **Harness Engineering 定义**：
>
> Harness engineering 最初指围绕测试、评测、基准等建立统一执行框架。在 agent-first 开发模式下，它被扩展为一种面向 AI 的软件工程基础设施：把代码、测试、CI、评测、文档、发布、设计历史和开发工具统一纳入一个可控、可观测、可回归的闭环中，使 agent 不只是生成代码，还能在明确约束下执行、验证、修复和交付变更。
>
> 让 AI（尤其是智能体 agent）可控、可维护、可持续演进的系统性方法论，是 AI 时代的"新软件工程"。它是一种新的思维方式，核心是通过工程化的机制保障我们AI在工作过程中输出稳定，风险可控，一致性更强。

> **"模型提供能力，应用提供界面，harness 负责将能力转化为可靠、可验证、可回归的生产级产出。"**

### 用一个具体例子理解

假设你在做一个系统软件项目，比如：
- 编译器
- 内核模块
- 分布式存储
- 网络协议栈
- 容器运行时

现在要修改一行关键逻辑，比如调度器参数或缓存策略。

在普通 **AI coding** 场景下：
- AI 帮你改了代码
- 生成一点测试
- 你自己去跑 CI、更新文档、看性能

在 **harness engineering** 场景下，流程可能是：

1. **Agent 接收 issue**：“调整缓存淘汰策略”
2. **Harness 拉取**相关设计文档、历史 PR、性能基线
3. **Agent 修改代码**
4. **Harness 自动触发**：
   - 单元测试
   - 集成测试
   - 压测 benchmark
   - 稳定性回归测试
   - API/ABI 兼容性检查
5. **其后**：若 benchmark 出现退化，agent 自动尝试修复或回退方案
6. **Harness 检查是否需要**：
   - 更新设计说明
   - 更新 release note
   - 更新运维手册
7. **生成**评测报告与 PR
8. **满足低风险策略**则自动进入灰度环境
9. **灰度指标异常**则自动回滚并归档失败案例

> **整条链路被包装成了一个可执行、可验证、可追责的系统。这就是 harness engineering。**

---

## 02 | 关键区分：Agent Harness ≠ Harness Engineering

很多人混淆了两个概念：

### Agent Harness（运行环境）
- 工具调用基础设施
- 状态管理模块
- 会话持久化
- 这是"技术实现层"

### Harness Engineering（工程方法论）
- 任务拆解策略
- 多 Agent 编排
- 异常治理机制
- CI/CD 全流程自动化
- 这是"工程治理层"

#### 🎯 一个形象的类比：

Agent Harness 好比汽车的发动机 and 变速箱——提供动力 and 传动；Harness Engineering 则是整车的工程设计——包括安全系统、制动系统、导航系统、保养规范，确保这辆车能安全、可靠地行驶在公路上。

> **"在生产环境中，你需要的不只是"能跑的发动机"，而是"能上路的整车"。"**

---

## 03 | Harness Engineering 的四大核心支柱

### 支柱一：任务拆解（Task Decomposition）

把复杂任务拆成可验证的小步骤，是 Harness Engineering 的第一原则。

❌ **错误做法**：
\`\`\`text
提示词："帮我分析一下这个行业的竞争格局"
\`\`\`

"复杂任务的成功率，等于各步骤成功率的乘积。拆解越细，可控性越高。"

---

### 支柱二：多 Agent 编排（Multi-Agent Orchestration）

单一模型很难搞定复杂任务。Harness Engineering 提倡"专人专事"的多 Agent 协作模式。

#### 典型编排模式：

- **1️⃣ 流水线模式**
  \`\`\`text
  研究 Agent → 写作 Agent → 审核 Agent → 发布 Agent
  \`\`\`
- **2️⃣ 专家评审模式**
  \`\`\`text
  Agent A (技术视角) 主任务 ─ Agent B (商业视角) ─ Agent C (用户视角) -> 汇总 Agent 整合输出
  \`\`\`
- **3️⃣ 反思改进模式**
  \`\`\`text
  执行 Agent 输出 → 批评 Agent 找问题 → 执行 Agent 修正 → 循环 N 次
  \`\`\`

📌 **编排关键点**：
- 明确每个 Agent 的职责边界
- 设计清晰的交接协议
- 设置超时和重试机制
- 记录完整的执行日志便于追溯

> **"好的编排，让普通模型也能产出专家级结果；差的编排，让顶级模型也频频翻车。"**

---

### 支柱三：异常治理（Exception Handling）

AI 的不确定性决定了异常必然发生。Harness Engineering 要求建立系统化的异常处理机制。

#### 常见异常类型：

1. **模型超时** | 响应时间超过阈值 | 自动重试或切换备用模型
2. **输出格式错误** | JSON 解析失败 | 自动修复或要求重生成
3. **内容质量低** | 不符合预设标准 | 触发反思循环或人工介入
4. **工具调用失败** | API 返回错误 | 降级处理或跳过该步骤
5. **上下文溢出** | Token 超限 | 自动摘要或分段处理

📌 **异常治理 SOP**：
- 👉 **检测**：设置监控指标和阈值
- 👉 **分类**：自动识别异常类型
- 👉 **响应**：根据预设策略自动处理
- 👉 **记录**：完整日志便于后续分析
- 👉 **改进**：定期复盘优化策略

> **"异常不是 bug，是系统进化的信号。每一次异常处理，都是 harness 变得更 robust 的机会。"**

---

### 支柱四：CI/CD 全流程自动化（Continuous Integration & Deployment）

传统软件的 CI/CD 流程在 AI 时代需要全新设计。

#### AI Harness 的 CI/CD 流程：

1. 提示词版本管理（Git）
2. 自动化测试（测试用例 + 预期输出）
3. 回归测试（修改后自动跑全量测试）
4. 质量门禁（通过率达标才允许合并）
5. 灰度发布（先小流量验证再全量）
6. 监控告警（生产环境实时监测）

📌 **关键实践**：
- **提示词即代码**：用 Git 管理提示词版本，支持回滚和 diff
- **测试用例即文档**：每个测试用例说明预期行为和边界条件
- **自动化回归**：每次修改自动运行测试集，防止退化
- **A/B 测试**：新旧版本并行运行，用数据决策

> **"没有 CI/CD 的 AI 系统，就像没有刹车的汽车——跑得越快，死得越惨。"**

---

## 04 | 生产环境实战指南

### 实战场景一：自动化内容生成流水线

- **背景**：某科技媒体需要每日产出 10 篇行业资讯文章。
- **Harness 设计**：
  - 步骤 1：**信息收集 Agent** - 监控 20+ RSS 源，筛选高价值内容，输出：待写选题列表。
  - 步骤 2：**资料研究 Agent** - 搜索补充资料，整理关键数据，输出：研究笔记。
  - 步骤 3：**文章撰写 Agent** - 根据研究笔记写作，遵循固定文章结构，输出：初稿。
  - 步骤 4：**质量审核 Agent** - 检查事实准确性，校验数据来源，输出：审核报告。
  - 步骤 5：**编辑发布 Agent** - 格式排版，生成标题/摘要，发布到 CMS。
- **效果**：
  - 人工干预从 100% 降至 15%（仅需处理审核不通过的稿件）
  - 产出效率提升 5 倍
  - 质量稳定性大幅提升

---

### 实战场景二：智能客服工单处理

- **背景**：某 SaaS 公司日均处理 500+ 客服工单。
- **Harness 设计**：
  - 工单分类 -> 简单问题直接回复 / 复杂问题升级处理
  - ↓ **信息收集 Agent**（调取用户数据）
  - ↓ **问题分析 Agent**（定位问题类型）
  - ↓ **解决方案 Agent**（生成回复草稿）
  - ↓ **人工审核** -> 确认/修改 -> 发送
- **关键设计**：
  - 设置置信度阈值，低于 80% 自动转人工
  - 所有 AI 回复需人工确认（初期）
  - 人工修改内容自动进入训练集
  - 每周分析人工修改点优化提示词
- **效果**：
  - 人工处理时间减少 60%
  - 响应时间从 2 小时降至 15 分钟
  - 客户满意度提升 23%

---

### 实战场景三：代码审查助手

- **背景**：某技术团队需要提升代码审查效率。
- **Harness 设计**：
  - PR 提交 -> 各种审查专有 Agent 独立诊断：
    - -> **静态检查 Agent**（语法/规范）
    - -> **逻辑审查 Agent**（潜在 bug）
    - -> **安全审查 Agent**（漏洞检测）
    - -> **性能审查 Agent**（效率问题）
    - -> **汇总报告 Agent**（整合所有发现）
    - -> 生成审查意见 -> 提交到 PR
- **关键设计**：
  - 每个 Agent 专注一个维度
  - 输出结构化意见（问题 + 位置 + 建议）
  - 支持开发者反馈（有用/无用）
  - 根据反馈持续优化
- **效果**：
  - 代码审查覆盖率从 30% 提升至 95%
  - 严重 bug 漏检率下降 78%
  - 审查时间从平均 2 天降至 4 小时

---

## 05 | 实施路线图：从 0 到 1 构建你的 Harness

### 第一阶段：最小可行 Harness（2-4 周）
- **目标**：跑通单一任务的自动化流程
- **关键动作**：
  - 👉 选择一个高频、规则明确的任务
  - 👉 设计 3-5 步的任务拆解
  - 👉 实现基础的工具调用和状态管理
  - 👉 添加简单的异常重试机制
  - 👉 建立手工测试用例集
- **验收标准**：
  - • 任务可稳定运行（成功率 > 80%）
  - • 异常情况有基本处理
  - • 有可重复的测试方法

### 第二阶段：工程化加固（4-8 周）
- **目标**：建立完善的异常治理和测试体系
- **关键动作**：
  - 👉 完善异常分类和处理策略
  - 👉 建立自动化测试框架
  - 👉 实现提示词版本管理
  - 👉 添加执行日志和监控
  - 👉 设计回归测试流程
- **验收标准**：
  - • 异常可自动分类 and 处理
  - • 测试可自动化运行
  - • 问题可追溯 and 定位
  - • 修改后可快速验证

### 第三阶段：规模化扩展（8-12 周）
- **目标**：支持多任务、多 Agent 编排
- **关键动作**：
  - 👉 设计通用的编排框架
  - 👉 实现 Agent 复用 and 组合
  - 👉 建立 CI/CD 流水线
  - 👉 添加 A/B 测试能力
  - 👉 完善监控告警系统
- **验收标准**：
  - • 可快速编排新任务
  - • Agent 可跨任务复用
  - • 发布流程自动化
  - • 生产环境问题可快速发现

### 第四阶段：持续优化（长期）
- **目标**：数据驱动的持续改进
- **关键动作**：
  - 👉 建立效果评估指标体系
  - 👉 收集用户反馈 and 人工修正
  - 👉 定期分析 and 优化提示词
  - 👉 探索模型升级 and 混合使用
  - 👉 沉淀最佳实践 and 模式库
- **验收标准**：
  - • 效果可量化评估
  - • 优化有数据支撑
  - • 经验可沉淀复用

---

## 06 | 常见陷阱与避坑指南

### 陷阱一：过度依赖单一模型
- **症状**：所有任务用一个模型，模型一变就全线崩溃
- **解法**：
  - • 关键任务准备备用模型
  - • 建立模型评估体系
  - • 设计模型切换机制
  > **"不要把鸡蛋放在一个篮子里，尤其是这个篮子还会自己变形状。"**

### 陷阱二：忽视提示词版本管理
- **症状**：提示词散落在代码各处，修改后无法回滚，不知道谁改的
- **解法**：
  - • 提示词独立文件管理
  - • 使用 Git 进行版本控制
  - • 每次修改写清楚变更原因

### 陷阱三：测试用例不足
- **症状**：只测"快乐路径"，边界情况和异常场景没覆盖
- **解法**：
  - • 设计全面的测试用例集
  - • 包含正常、边界、异常三种情况
  - • 定期补充新发现的场景

### 陷阱四：缺少监控告警
- **症状**：生产环境出问题了，用户投诉了才知道
- **解法**：
  - • 设置关键指标监控（成功率、响应时间等）
  - • 建立告警阈值和通知机制
  - • 定期 review 监控数据

### 陷阱五：人工介入时机不当
- **症状**：要么完全不放权，要么完全不管
- **解法**：
  - • 明确人工介入的判断标准
  - • 初期保持人工审核，逐步放开
  - • 保留紧急情况下的人工接管能力
  > **"自动化不是消灭人工，而是让人做更有价值的事。"**

---

## 07 | 写在最后

Harness Engineering 不是一个具体的工具或框架，而是一套**思维方式**和**工程实践体系**。它的核心精神是：**承认 AI 的不确定性，用工程的方法来管理这种不确定性。**

这不是一蹴而就的事情，需要持续迭代和优化。但这是 AI 走进生产环境的必经之路。

💡 **给你的行动建议**：
- 👉 从一个小任务开始，实践任务拆解
- 👉 为你的 AI系统添加第一个异常处理
- 👉 建立最简单的测试用例集
- 👉 开始记录每次问题和改进

> **好的 harness 不是一天建成的，但每一天都可以变得更好。**

#Harness #HarnessEngineering #Harness实战 #AI工程化 #智能体 #AI应用 #任务拆解 #多Agent编排 #异常处理 #CICD #AI开发 #工程管理 #人工智能 #技术深度`
  },
{
    id: "ai-2",
    module: "AI天空",
    category: "Skill兵器谱",
    title: "Claude Code拥有50多个命令。大多数开发者只用到5个",
    summary: "Claude Code实用指令众多，但绝大多数开发者只用到其中3到5个，其余指令藏在文档里吃灰。掌握它们，能让生产力原地起飞10倍",
    content: `原创 **dev** **大迁世界** 2026年4月9日19:00 福建

说句扎心的话：**Claude Code 拥有超过 50 个指令，但绝大多数开发者只会在那儿干巴巴地敲其中的 3 到 5 个。**

剩下的指令就那么冷冰冰地躺在 \`/help\` 文档里吃灰。它们原本能让你的生产力原地起飞 10倍，前提是——你得知道它们的存在。然而，根据 2026 年 3 月的最新数据，那些精通 15 个以上指令的硬核开发者，交付速度比普通人快 3 到 4 倍。尽管如此，很多人依然只是把它当成“终端里的 ChatGPT”来糟蹋。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/8cc144f4e058939bd5936a7478538637-sz_195039.png)

### 指令的三重境界：看透工具的底层逻辑

在深挖具体指令前，你必须理解 Claude Code 的操作逻辑。它不仅仅是一个对话框，而是一套立体的操作系统。换句话说，它分为三类：

- **第一类：CLI 指令（启动配置）：** 在终端开启 Claude 时注入的初速度。
- **第二类：斜杠指令（会话核心）：** 在交互过程中输入的 \`/\` 招式。
- **第三类：快捷键（神经反射）：** 真正的高手从来不浪费时间打完整个单词。

### 第一部分：保命级核心指令（每日必用 Top 10）

这 10 个指令是你的职业底座。不管你是刚入行的新手还是老油条，先把它练成肌肉记忆。

#### 1. /init —— 赋予项目“灵魂”

它的核心意义在于创建一个 \`CLAUDE.md\` 文件。这是项目的“长期记忆”。与其一遍遍跟 AI 解释你的代码规范，不如一次性写进这里。

\`\`\`text
# CLAUDE.md
## Authentication
- Use JWT tokens, not sessions
- Store in httpOnly cookies
## Testing
- Write tests for all API endpoints
- Use Jest, not Mocha
## Error Handling
- Return structured errors: { error: string, code: number }
\`\`\`

#### 2. /compact —— 内存大清理

当上下文占用过高时，它能精准总结核心决策。2026 年 2 月更新后，这个操作现在是**秒级完成**。建议在占用率达到 70-80% 时主动执行。

#### 3. /clear —— 彻底重启

切换完全不同的任务时，用它清空历史。不过要注意，这也会擦除该目录下的指令历史。

#### 4. /model —— 大脑切换

在 Sonnet（平衡）、Opus（巅峰）和 Haiku（极速）之间横跳。

\`\`\`text
/model sonnet      # 切换到 Sonnet 4.6 (日常利器)
/model opus        # 切换到 Opus 4.6 (架构杀手)
/model haiku       # 切换到 Haiku 4.5 (体力活专家)
\`\`\`

#### 5. /cost —— 实时算账

别等月底看到账单才心惊肉跳。实时监控你的 Token 消耗，毕竟 Opus 虽好，烧起钱来也挺疼。

\`\`\`text
Session cost: \$2.47
Input tokens: 48,392
Output tokens: 12,847
Model: claude-sonnet-4-20250514
\`\`\`

#### 6. /context —— 进度条预警

显示当前上下文百分比。如果你发现 Claude 开始“装傻”或记性变差，赶紧看看这里。

\`\`\`text
Context usage: 67% (134,400 / 200,000 tokens)
\`\`\`

#### 7. /diff —— 拒绝开盲盒

查看 Claude 刚才到底改了哪行代码。提交前的代码评审，全靠它了。

\`\`\`text
/diff              # Show all changes
/diff src/auth.ts  # Show changes to specific file
\`\`\`

#### 8. /help —— 实时说明书

指令会随版本更新而变，这里是你唯一的权威信源。

#### 9. /memory —— 现场改规矩

无需离开会话，直接编辑 \`CLAUDE.md\`。此外，你可以使用快捷语法：

\`\`\`text
# Use async/await for all database queries
\`\`\`

以 \`#\` 开头的笔记会直接追加到记忆文件中。

#### 10. /resume —— 续上那段缘

加载并继续之前的对话。你可以对 Claude 说：“帮我找找去年 12 月那个会话”，它真的能帮你翻出来。

### 第二部分：高阶进阶指令（拉开差距的杀手锏）

#### 11. /btw —— 不打断的插嘴

这是 2026 年 3 月最出圈的神技。在 Claude 埋头重构时，你可以突然插个题外话，问完它会自动回到刚才的任务。

#### 12. /fast —— 极速模式

开启 API 优化设置。同样的 Opus 4.6，开启后响应速度像打了鸡血一样快。

#### 13. /plan —— 谋定而后动

进入只读规划模式。Claude 会先给你看方案，你点个头，它才敢动手。这种“三思而后行”的逻辑能预防 90% 的事故。

#### 14. /todos —— 永不消失的任务书

一个能跨会话存在的清单。即便你关掉 Claude，未完成的工作依然在那儿盯着你。

#### 15. /simplify —— 2026 全新代码评审

取代了过时的 \`/review\`。它会调用三个并行代理，从安全性、性能、规范性三个维度对你的代码进行全方位的“降维打击”。

### 第三部分：CLI 启动标志（真正高手的暗号）

这些标志控制着 Claude 启动时的初始状态。

- **\`claude --print "..."\`**：一闪电战。执行单个查询后立即退出，非常适合脚本编写。
                                        result=\$(claude --print "Generate a random UUID")
echo \$result
- **\`claude -c\`**：一键接续上次在该目录下的事业。
- **\`--agents\`**：启动时预设子代理。
                                        claude --agents '{
  "test-writer": {
    "role": "Write comprehensive Jest tests",
    "model": "claude-sonnet-4"
  }
}'
- **\`--dangerously-skip-permissions\`**：⚠️ 仅在受信任的容器环境（如 Docker/CI）中使用。它会跳过所有审批，开启全自动狂飙模式。

### 第四部分：快捷键（你的效率倍增器）

- **\`Shift + Tab\`**：在正常、自动接受、规划模式之间一键循环。
- **\`Esc Esc\`**：瞬间呼出回滚菜单。你可以选择只回滚代码而保留对话，或者反之。
- **\`! + 命令\`**：在会话中直接执行 Bash 指令。例如 \`! git status\`。
- **\`@ + 路径\`**：文件路径自动补全。
- **\`Ctrl + T\`**：开关任务列表。

### 第五部分：那些被藏起来的“禁术”

- **\`/vim\`**：给输入框加上 Vim 键位。是的，你甚至可以在 Prompt 里用 \`h/j/k/l\` 导航和编辑。
- **\`/remote-control\`**：在手机上控制你电脑里的 Claude。哪怕在下班路上，也能远程操控它修个 Bug。
- **\`/usage-report\`**：生成月度分析报告，详细拆解你的时间都花在哪了，Token 都烧在哪了。

### 第六部分：实战全自动化工作流

#### 场景：长达一天的复杂重构

1. **开启规划模式** \`claude\` -> \`Shift+Tab\` (进入 Plan 模式)
2. **描述重构** “将 Auth 模块从 session 模式改为 JWT，并使用 bcrypt 加密密码。”
3. **监控并压缩** \`/context\` 查看占用。当达到 70% 时执行：\`/compact retain auth patterns and migration strategy\`
4. **评审与提交** \`/diff\` 查看改动。\`/simplify\` 进行最终质量检查。\`! git add .\` -> \`! git commit -m "feat: jwt migration"\`
5. **导出归档** \`/export\` 将这套神操作存为团队的知识资产。

### 最后

Claude Code 的 50 多个指令，你不需要一天全学会。然而，如果你能每周强迫自己加一个新招式，一个月后你就能把同龄人远远甩在身后。`
  },
{
    id: "ai-3",
    module: "AI天空",
    category: "前沿动态",
    title: "不用RAG！卡帕西的LLM Wiki方案就很香",
    summary: "用两个文件夹加一个CLAUDE.md文件，轻量级搭建个人知识库，简单高效，知识可积累",
    content: `**二哥呀** **技术派** 2026年04月09日 10:11

大家好，我是二哥呀。

这周技术圈被卡帕西的一条推文刷屏了。他说了这么一句：现在花在 LLM 上的 token，大部分不是在写代码，而是在整理知识库。

他给了一个叫「LLM Wiki」的方案，两个文件夹，一个 CLAUDE.md，没了。

没有向量数据库，没有 embedding 模型，没有混合检索 😄。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/12ba8574382baea255a43a87ba7f7218-sz_1286122.png)

我看完的第一反应是：就这？

说真的，这个方案简单到让人怀疑人生。但我还是得亲自试试，才知道是不是真的好用，还是只是纸上谈兵。

## 01、LLM Wiki 到底是什么？

卡帕西把这个方案发到了 GitHub Gist 上，核心就三层结构，简单明了。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/7176ccdc4aa0866ca73095890eed9ccd-sz_351680.png)

**raw/** —— 你的原始素材，可以是任何你想整理的内容。这是你的 curated collection，作为知识库的事实来源，LLM 只读不写。

**wiki/** —— LLM 生成的知识库。它读取 raw/ 里的文章，编译成结构化的 wiki 页面：概念定义、实体页面、交叉引用、矛盾标注。里面还有一个 index.md，是内容目录，LLM 每次更新都会维护它。查询时好的答案也会存回这里，成为新页面。

**CLAUDE.md** —— 知识库的规则文件（schema）。告诉 LLM wiki 的结构、约定、工作流程。

卡帕西这套方案，是让 LLM 先把书读完、理解完、做好笔记，考试时翻笔记、回顾自己的理解、不翻原书，和 RAG 不太一样。

除了「理解」，还有一个大区别——知识会积累。

你今天问了一个综合性的问题，LLM 的回答直接存回 wiki/ 成为新页面，明天再问相关问题时，它已经有了上次的分析结果。RAG 没有这一步。

卡帕西把这套流程叫做** Ingest-Query-Lint**：

- Ingest：新素材放进 raw/，LLM 读取并更新 wiki/ 里的相关页面，同时更新 index.md
- Query：对 wiki 提问，LLM 查 index.md 定位页面，综合给出答案
- Lint：定期检查 wiki 里的过时内容、孤儿页面、缺失的交叉引用

## 02、搭建属于你的 Wiki

光说不练假把式，我花了一下午搭了一个自己的 LLM Wiki。

根目录是 docs/src/sidebar/itwanger/，里面建了两个文件夹：

- ai/ —— 我近期写的所有 AI 相关的文章，94 篇，涵盖 OpenClaw、Claude Code、Skills、Codex 等主题，都是 curated 过的
- wiki/ —— 空的，交给 LLM 来维护

然后写了一个 CLAUDE.md：

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/c3c857b0e325e50beea99acfa3e19d9f-sz_57377.png)

把任务丢给 Claude Code，让它开始「编译」。

提示词：请编译 ai/ 文件夹里的所有文章，更新 wiki/ 和 index.md

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/66c8cfca070834710d462cebe0ee1728-sz_1045602.png)

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/b58e66f132983ec1f9b86b22af791982-sz_976442.png)

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/556bca2626209bab6b108a2819081085-sz_753765.png)

大约 10 分钟后，wiki 文件夹里多了十几个 markdown 文件。有「OpenClaw.md」、「Claude Code.md」、「Skills.md」、「Codex.md」、「Agent.md」……每个文件里都有清晰的定义、引用的原文链接、相关的其他概念。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/bd2ffcc5500f7a5d900cccfbfa4db084-sz_1579383.png)

还有一个** index.md**，是 LLM 自动维护的内容目录：

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/67c3cd686e1886924c3ea1cd4b0bb0fa-sz_65525.png)

这个 index.md 是查询时的入口。LLM 先读它，快速定位到相关页面，而不是遍历整个 wiki。

好家伙，我自己都没注意，小号已经写了丰富内容。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/bcaf0f88ca7f28961f729de7d849a97c-sz_1823611.png)

然后我试着问了一个问题：「我想选一个 AI 编程工具，该用 Claude Code 还是 Codex？」

Agent 没有直接给答案，而是先查了 wiki 里的相关页面，然后给了我一个结构化的对比：

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/c753173376da39a726bd28e512d1b0da-sz_841459.png)

再比如说，我问：

我写过哪些关于 Skills 的文章？核心观点是什么？

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/c74e34049917c3b4254dcab478e892cb-sz_1518046.png)

## 03、和 RAG 比，真的更好吗？

现在我来说说大家最关心的问题：卡帕西这套方案，真的比 RAG 好吗？

先说结论：至少不用接 Embedding 模型和向量数据库，比较轻量级。但如果你的文档量是十万级，那还是得上 RAG。

RAG 有这么一个问题。

没有知识积累。你今天问了一个复杂问题，LLM 花了很多 token 分析了一堆文档，给出答案。明天你问一个相关的问题，它又要重新分析一遍。上次的思考过程，没有沉淀下来。这就像你每次做数学题都要重新推导一遍公式，而不是直接套用已经证明过的定理。

LLM Wiki 解决了这个问题。

「编译」阶段，LLM 已经把文档读完了、理解完了、做好笔记了。提问时，它翻的是自己的笔记，不是原书。笔记是结构化的，有索引、有链接、有交叉引用，检索效率比向量相似度高。

更重要的是，知识会积累。好的回答可以存回 wiki，变成新的知识节点。这个知识库会越来越厚，越来越聪明。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/a8f54d2dafeacc9fe8dacb48f6d776c6-sz_1099357.png)

## 04、卡帕西 Wiki 的底层设计

用久了你会发现，这套三层结构不是随便设计的，它暗合了计算机系统的一个经典架构——缓存层级。

CLAUDE.md 是 L1 缓存，最小、最快、最常被访问。每次 Query 都要读它，就像 CPU 每次运算都要访问寄存器。index.md 是 L2 缓存，比 CLAUDE.md 大，比遍历整个 wiki 快，先查索引再定位具体页面。wiki 页面本身是 L3 缓存，容量最大，访问最慢，只有必要时才读取。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/2f5b72ff59712ff25c25479ef07857f4-sz_1540863.png)

这和 CPU 缓存的访问延迟数量级对应：CLAUDE.md（几个 token）< index.md（几百 token）< wiki 页面（几千 token）。卡帕西没明说，但他设计的 Ingest-Query-Lint 流程，本质上是在优化缓存命中率 and 更新策略——用空间换时间，用预计算换查询速度。

**另一个底层问题是：知识是否是有损的？**

94 篇原始文章编译成 wiki，信息熵必然减少。

这触及一个深层问题：我们人类理解一本书，其实也是「压缩」——记住核心观点，忘记具体措辞。LLM Wiki 的压缩，某种程度上模仿了人类的学习过程。但代价是：那些「不可压缩」的东西——风格、个性、情绪——在 wiki 结构里没有位置。

卡帕西的方案假设「知识是可结构化的」，但你的原始素材里，可能有些东西是反结构化的。这是 LLM Wiki 的理论边界，也是它和最原始的文本之间，永远无法弥合的鸿沟。

## 05、这套方案适合谁？

说了这么多，这套方案到底适合什么人用？

**第一类：个人知识管理**

如果你平时会读很多技术文章、论文、博客，但读完就忘，想找的时候找不到，那 LLM Wiki 是个神器。

把 curated 过的素材放进 raw/，让 LLM 帮你整理成结构化的 wiki，以后想问什么直接问，不用自己翻。

**第二类：小型团队的知识库**

团队里有一些内部文档、技术规范、项目笔记，分散在各地。用 LLM Wiki 统一整理，新人入职时直接问 wiki，不用追着老人问。

**第三类：研究和学习**

你在研究一个新领域，读了一堆论文和资料，想建立一个系统的认知。LLM Wiki 可以帮你梳理概念关系、发现矛盾、建立知识图谱。

比如你想系统了解「AI 编程工具生态」，收集了十几篇关于 Claude Code、OpenClaw、Codex、Cursor 的文章。传统的做法是读一遍，自己做笔记，画思维导图。用 LLM Wiki，你把 curated 过的素材放进 ai/，让 LLM 帮你整理出核心概念（Agent 架构、Skills 体系、Gateway 设计）、每种工具的优缺点、不同方案之间的适用场景。相当于请了一个研究助理，帮你做了第一轮的梳理工作。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/9ae77fb9cc72885220d935bb863b69c1-sz_1259077.png)

用目录的方式，根据知识结构生成的多层级文件夹，并且每个文件夹都有摘要 and 索引，然后还有一个总索引，整个文件夹版本的知识库完全可以按照脑图的架构无限扩展，遇到标签和其他可以多分类的信息点，会在摘要文件和索引文件中注明。

效率非常高。毕竟个人知识库数据肯定不会达几万条。如果只是几万条，完全够用。与向量数据库比，轻便多了。

## 05、开源复刻版本

卡帕西发布 Gist 后，GitHub 很快出现了好几个开源复刻，我挑几个试过还不错的推荐给大家。

第一个是 **llm-wiki-compiler**（Python），把手动流程自动化了：监控 xx/ 文件夹变化，自动触发 LLM 编译，增量更新 wiki。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/e847ce53f3b0b7e1f79652a266f58958-sz_1460395.png)

第二个是** obsidian-llm-wiki**（Obsidian 插件），直接把 LLM Wiki 集成到 Obsidian 里。如果你本来就是 Obsidian 用户，这个体验最无缝。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/e09d00a07f73f6c9c4429bcbf1b4bd19-sz_1289129.png)

我平常的文字稿就是放在 Obsidian 里的。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/8429cb9f530eb6dc6ac5b6db764e77c0-sz_482356.png)

第三个是 **Benboerba620/karpathy-claude-wiki**，基于投资视角写了一个 Karpathy 的个人 wiki。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/eebc87160e512adb5f1dcbc271267701-sz_1878774.png)

GitHub 上搜「karpathy llm-wiki」能找到更多，有的是 VS Code 插件，有的是完整的 Web 应用。本质上都是基于卡帕西的核心思想做的封装，两个文件夹加一个配置文件，理解了底层原理用哪个都行。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/aabaaf2c8d441ab2a88e123428afd828-sz_1110050.png)

## ending

卡帕西的 LLM Wiki 方案，给我的最大启发不是技术，而是思维方式。

我们总想把 AI 当成一个「更聪明的搜索引擎」，问什么就检索什么、答什么。但卡帕西告诉我们，AI 可以是一个「知识整理者」，帮你读书、做笔记、建立理解。

这个转变，从「检索」到「理解」，从「拼答案」到「用知识」，可能是 AI 应用的一个新方向。

【**有时候，简单的方法比复杂的方法更有力量。**】

不是说 RAG 没用了，而是对于大多数人、大多数场景，我们可能根本不需要那么重的技术栈。两个文件夹，一个配置文件，就能搭起一个个人知识库。

如果你还没试过，建议搭一个。把手里那些「收藏了但从来没看」的文章丢进去，让 LLM 帮你整理一遍。你会发现，原来自己已经积累了这么多知识。

我们下期再见，冲啊！`
  },
{
    id: "tea-1",
    module: "技术茶馆",
    category: "架构师访谈",
    title: "走近数据主架樊进忠",
    summary: "二十一载深耕数据架构，他以\"稳、通、活\"为准则，主持推进多个重大专项，筑牢iuap数据底座，是数据主架构师职业的最佳注解",
    content: `**编者按**

在BIP架构师团队，有这样一群人——他们不直接写业务代码，却掌控着数据的“高速公路网”；他们不直面项目客户，却决定了平台的数据治理水位线。他们掌控着数据架构的灵魂。本期访谈的主人公，就是**数据与集成平台**和**总体设计部**的数据主架构师——樊进忠。二十一载深耕，他用一次次细致而坚定的技术攻坚，筑起了iuap数据底座的稳固根基。

## 一、一盏灯，一台电脑，一个“数据底座”

2026年夏，“515迭代”上线夜。此时已到了5月16日的凌晨三点，产业园中区的灯火渐渐熄灭，而樊进忠的工位上，屏幕依然亮着。

他正盯着一张架构图沉思。

那张图上，是数据从采集、清洗、建模、服务到应用的全链路——每一条线段、每一个节点，对应的是iuap数据平台背后亿级数据的流转逻辑。这条"看不见的高速公路"，正是他和团队日复一日的阵地。

这是数据主架的真实写照：**不是在画数据架构图，就是在验证数据的流转和规范性。**

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/096aecfb93cfa4438861d613956bcb57-sz_1871945.jpg)

## 二、从代码到架构：数据主架的成长之路

### 一位老兵的时间线

樊进忠与用友的缘分，可以追溯到多年前。从早期的U9、畅捷通公共研发团队，到业务中台、数据中台，再到如今的数据与集成平台架构部和总体设计部——他几乎完整见证了iuap数据产品的演进。

从文化活动档案中，我们可以勾勒出他近年留下的足迹：

| 年份 | 事件 | 备注 |
| --- | --- | --- |
| 2019年8月 | 智能分析运营部代码review | 团队技术交流 |
| 2020年9月 | 数据中台六部门野三坡团建 | 联合团建 |
| 2021年9月 | “点亮金盘杯”乒乓球赛 | 赛场身影 |
| 2022年4月 | 技术平台和数据中台团体挑战赛 | 数据中台队成员 |
| 2025年2月 | iuap数据与集成平台部业务启动会 | 架构部核心成员 |
| 2025年9月 | 数据与集成平台架构部东灵山团建 | 架构部小分队 |
| 2025年11月 | 西区冬季工作照 | 专注的身影 |
| 2026年2月 | 数据与集成平台部工作启动会 | 新一年启程 |
| 2026年5月 | 515迭代上线工作照 | 专注的身影 |

不难看出：樊进忠是一位长期主义者——他选择在数据架构这条赛道上一路深耕，不追逐热点，不轻易换道。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/f9c6031966450f58f028c7a17de5c8ac-sz_2426267.jpg)

### 数据架构师的"三力模型"

在总体设计部 and 开发部，数据主架承担着三大核心职责：

（1）技术架构力：设计和开发产品技术架构并持续优化，承担BIP架构部统一技术改造的宣贯和推动任务，赋能团队、提升团队整体技术水平。

（2）技术攻关力：承担技术难点的攻关任务，紧跟前沿技术，推动新技术引入和落地。

（3）架构统筹力：协调各架构师整体把握数据中台各产品的架构设计，评估日常架构设计细节。

这三种能力的交汇点，正是樊进忠的平日工作。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/d000440e4b16ff6f012063b310bc7f6f-sz_1489606.jpg)

## 三、深耕一线：在细碎攻坚中筑牢技术根基

翻开樊进忠的工作台账，一个个以编号命名的项目文件夹，串联起他攻坚与突破的完整轨迹。

### 核心攻坚，数据底座的夯实之年

2025年下半年，樊进忠所在团队迎来了几场硬仗。

核心2分库及Schema合并专项是下半年最重要的一场战役。团队完成了上海医药等租户数据迁移至分库的调研、方案制定及实施，重点推进核心2公共查询仓迁移。处理了大量SQL脚本变更和上线支持，解决了因Schema合并导致的报表查询报错问题，废弃数据库的清理同步推进，冗余数据的清除有效提升了数据库性能。

脚本规范与版本升级持续推进。樊进忠持续完善数据工场、智能分析等领域的公共脚本及增量脚本抽取规则，处理了大量脚本的补录、合并、差异分析及规范化提交。V5、V7等多版本的数据模型抽取、安装盘脚本差异分析、R6升级到V5的数据库对比——每一项都关乎系统的平滑演进。

智能分析与内容多语专项改造，是下半年最具技术含量的专项之一。樊进忠主导完成了智能分析平台对接“翻译工作台”的方案设计、评审与开发实现，为多个业务对象注册了多语表，配置并验证了多语脚本抽取规则，开发并验证了内容多语数据的全量、增量刷库脚本，协同解决了语义模型、宽表模型、指标库等多处一致性问题。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/4cb1632427e2aaaeb3e4c700dc093c64-sz_2357006.jpg)

### 日常支持：无数个“小问题”背后的技术坚守

专项之外，日常支持构成了樊进忠工作的大半内容：各模块环境安装或升级脚本报错、Git提交失败、数据源配置问题、仪表板链接报错、应用编码调整…… 多个项目齐头并进，鞍钢生产并发、DSP环境优化等紧急问题随时插入，睿智时代、华润健康等客户场景下的环境适配与版本升级差异梳理，也在他的工作范围之内。

2026年，高强度的日常攻坚仍在延续。数据治理、微服务空检查工具落地、主键冲突处理、租户迁移、多语言适配、CPU报警治理、集成平台数据下云——风起云涌的任务，铸就了日复一日的技术坚守。SQL效率优化、索引治理、字段规范，从不因“小”而被轻视；租户适配、环境异常，从不因“频”而被怠慢。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/75693ccc2670377343ef670623080cbb-sz_1433723.jpg)

## 四、想对新人说的话：如何成长为一名合格的数据架构师？

### 什么样的数据架构才算得上“好”？

数据架构的核心命题，不是“用什么技术”，而是“能不能承得住业务的现在，还撑得起业务的未来”。

好的数据架构有三个标准：

- **稳**：底层模型稳定，不因为业务微调就伤筋动骨。
- **通**：数据在各系统间流转无阻，不存在“孤岛”。
- **活**：扩展性强，新的业务域接入成本低。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/6955deccca9cd386ab2f4bc64481650b-sz_1890592.jpg)

### 合格的数据架构师需要具备哪些能力？

数据架构师有五大核心能力维度：

1. **夯实底层根基，明确深耕方向**——夯实数据基础理论，吃透底层逻辑，避免浮于表面；找准自身方向，长期深耕垂直领域。
2. **锤炼建模能力，沉淀实战经验**——熟练掌握ER图、工程结构两大核心工具，快速拆解项目整体架构；严格规范库、表、字段的底层设计，在大量项目实战中适配不同业务场景。
3. **把控架构评审，实现全链路落地**——主导全链路架构评审，遵循“概念模型→对象模型→数据模型”的标准路径；主动识别、规避数据模型潜在风险，做好风险校验。
4. **拓宽行业视野，拔高设计思维**——对标Palantir等行业标杆，借鉴成熟架构理念；熟练运用UML建模等标准化方法，统筹数据产品、数据流向、业务流向三大维度。
5. **深度融合业务，发挥架构价值**——精准拆解业务流程，梳理核心数据口径，以数据洞察、需求洞察、技术落地三位一体，实现技术价值向业务价值的转化。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/0d2032053906fb2d32a755382d98779f-sz_2273269.jpg)

## 五、尾声：数据主架的方法论

采访临近尾声，我们请忠哥用一句话总结他的工作哲学。他表示：**"架构不是画出来的，是踩坑踩出来的。每一次系统重构，都是一次认知升级。"**

这句话，或许正是对数据主架这份职业最朴素的注解——他们站在系统与业务之间，用理性的架构思维，为数据的流通铺路，为产品的演进筑基。二十一载深耕，细碎攻坚，每一次深夜的屏幕灯光，都在默默记录着这条“看不见的高速公路”上，那些不为人知的坚守与突破。

最后，小编想说：如果要在《三国演义》中寻找一位能够体现出忠哥靠谱、实干、能力强劲的人物，那一定是西蜀“五虎上将”中的黄忠！

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/d589844bc9eec0cbaae62bd0f72d92ce-sz_1371860.jpg)`
  },
{
    id: "tea-2",
    module: "技术茶馆",
    category: "品茗论道",
    title: "三顾茅庐—YonClaw篇",
    summary: "本文以古典叙事框架，映射YonClaw这款企业级超级智能体的核心能力——远程通道与Claw执行、Skill中心与定时任务、大型企业治理全景——期望以通俗易懂的方式，帮助读者理解YonClaw\"懂业务、懂用户、可执行、更安全\"的产品定位",
    content: `## 引子：IT江湖的一声叹息

话说当今制造业江湖，有一家颇成气候的企业，CEO刘总正值壮年，企业也从创业期迈入了规模化发展的关键阶段。然而，规模一大，“大企业病”便接踵而来——**系统林立，流程繁琐，决策缺乏实时依据，新员工赋能成长也遇到瓶颈**。刘总日夜操劳，常叹“千军易得，一将难求”。

转机来自一次行业峰会。会上，业界咨询专家徐庶私下对刘总说：“主公若要根治大企业病，非一人不可。吾有一友，隐居隆中卧龙岗，雅号孔明。此人深谙大型企业治理之道，得之可安天下。但这位高人从不透露联系方式，除非登门拜访，或能一见。”

刘总闻言，眼睛一亮：“既有此等人才，何不早说！”遂决定亲赴隆中，请孔明出山。同行者还有CTO关总和CFO张总，两位皆是跟随刘总打天下的元老。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/b9d4070c3d2e8241c17b70530b261be3-sz_1320212.jpg)

## 一顾隆中——远程通道，初试锋芒

初春时节，隆中细雨蒙蒙。刘总一行三人驱车抵达卧龙岗，却扑了个空——孔明不在，云游去了。

书童见刘总一行来意恳切，便拨通了孔明的视频。屏幕上出现一位气质清雅的中年人，正是孔明。

刘总抱拳道：“我是ＸＸ集团CEO刘某。久仰先生大名，今日冒昧来访实因企业困顿，万望先生指点。”

孔明微微一笑：“刘公客气了。贵司之困，吾亦略有所知。恰好，我这里有一件企业神器，名叫YonClaw，或可解刘公燃眉之急。”说罢，孔明在手机微信上调出“微信ClawBot”，利用YonClaw的微信通道给刘总做了演示。

### 能力展示一：远程通道 + Claw执行（AI创作场景）

孔明说道：“刘公，我现在要通过YonClaw，为您旗下企业的支柱产业进行一次基础的市场分析，并给出建议报告。”

刘关张三人面面相觑，表情错愕。片刻，刘总问道：“先生，我的企业从资料到数据，都没有提供给您。您又身在异地，这市场分析从何说起啊？”

孔明笑道：“虽无相关资料，但我对贵公司有所了解，曾经浏览过您的企业主页。那上面发布的公开信息，够我出具一份比较浅显的市场分析报告了！”

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/4508bc2ae6e6ec6814d38dbc2b070163-sz_1510671.jpg)

随即，孔明把刘总企业的主页地址输入 to 微信ClawBot中，又通过语音下达了指令：“从上述地址获取和集团产业、业务相关的网页，把这些信息保存为文档、影像文件，利用这些知识构建一个小型知识库。随后帮我创作一篇市场分析报告，主题为‘ＸＸ集团支柱产业的市场分析’。”

一炷香的功夫，YonClaw便完成了以下全部流程，并给出了分析报告：

*· 通过常驻的YonClaw远程通道把指令直接送达AI，无论使用者身在何地；*

*· 自动调用“**从网页构建知识库**”技能，根据提示词获取级联网页上的所需信息，再调用文库子技能，按既定策略把文档、图片、视频等上传到知识库，同时进行索引、切片、标注等AI构建工作；*

*· 自动调用“**基于知识库/知识本体的AI创作**”技能，从知识库/本体及外延知识库/图谱当中，获取所需知识，进行市场洞察与分析推理，结合提示词的要求创作出所需文案；*

*· 在YonClaw的消息通道或终端上，把创作结果显示给用户，或根据要求进行持久化。*

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/04803ede8a0542c9306fcac4d3ba3eb9-sz_404004.png)

关总看着屏幕上生成的分析报告，目瞪口呆：“这从前要专家讨论半天整理素材、再花半天分析数据、组织呈现的工作，现在一句话就出来了？”

孔明道：“远程通道支持云端规划、本地Claw受控执行，全程留痕可审计，这就是我所说的企业级超级智能体——神器YonClaw。”

刘总迫不及待与先生深谈其后。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/b855baee261efd2d6402cd6037eadcf8-sz_1525719.jpg)

## 二顾隆中——三个锦囊，再显神通

半月后，刘总二赴隆中。这一次，他带着更具体的问题：**企业扩大规模后有更多新人加入，培养新人的成本也在增加，同时又不想给担任导师的主力员工带来工作上的负担，因此尤其需要AI赋能新人自主成长。**

****

此时的刘总，已经按照孔明所赐秘籍的指导，在自己的企业建立起了知识库和知识智能体，并提供了对外的知识服务API。

然而，孔明依旧不在——他在外出前，给书童留下了一台装有YonClaw客户端的电脑和三个锦囊，嘱咐“有缘人自会用到”。

刘总三人到达后，书童请刘总在电脑前就坐，并交给他三个锦囊。刘总打开后，发现每个锦囊里有一个Skill and 一张纸条，于是他遵照纸条的提示，在YonClaw的技能中心里陆续导入了这三个Skill。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/51ff705611769a1abf86238e85e9bff1-sz_1658528.jpg)

### 能力展示二：技能中心 + 定时任务（AI赋能场景）

****

**锦囊一（规范问询与纠错Skill）：**刘总按照锦囊指引，在YonClaw的技能中心将Skill激活，并在首次使用时输入了自己公司所用知识服务的登录凭据，API连接成功。

当刘总尝试向YonClaw提问和专业术语、规章制度、技术/设计/安全/性能/质量/运维规范等相关的问题时，YonClaw通过技能触达刘总公司的知识库，由大模型获取答案并答复在屏幕上；而当刘总输入了一个示例，YonClaw则结合规范文档的要求，对示例进行了检查与纠错，给出了修正后的合规内容。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/2ad724a0207aa06a2b573167533148b7-sz_268503.png)

****

**锦囊二（企业知识问询Skill）：** 作为上一Skill的升级，锦囊二不再限于回答规范类问题，而是把范畴扩大到了产品、市场、售前、实施、HR、IT、行政、法务、党建等企业各个维度主题知识的内容。在提问时，使用者甚至可以指定一个（或多个）知识智能体来回答，也可以由YonClaw通过多智能体调度来回答。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/ba0690e6acf2d2360f9321abe64f8080-sz_169978.png)

****

**锦囊三（培训课程回看Skill）：**本锦囊的技能支持员工在线学习**新人入门课程**或**进阶专家分享**。只需输入课程名称、讲师名或其它关键词（如“方亚利讲的数据库规范”），YonClaw就会自动从历年培训清单中检索匹配记录，定位对应视频、课件等资产，一站式推送到提问者面前。并可配置好定时任务，当知识库中有符合特定条件的新课，即自动推送给学习者。

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/e334f45c8e7ccf19cce3c3d272e9fc13-sz_100596.png)

转瞬间，三个员工/新人赋能成长的高频需求被导入到YonClaw的技能当场解决。

此时，YonClaw的定时任务弹出了孔明预置的留言：“Skills乃企业业务能力资产。**YonClaw的Skill体系，强调可治理、可复用、可交付——每个Skill需经过审核上架、权限绑定、审计留痕，方可部署于生产环境**。刘公日后使用，切记安全边界。”

刘总心中已下定决心：必须亲见此人，以礼相邀。

## 三顾隆中——促膝长谈，共谋天下

又过两周，刘总三赴隆中。这一次，刘总带着毕恭毕敬之心，与孔明在草堂中围炉而坐，关总、张总作陪，从午后谈到深夜。

孔明首先开篇：“刘公两次前来，已见识了YonClaw的远程执行与Skill自动化。但YonClaw真正的大用，不止于此。今日我与刘公详谈——YonClaw如何支撑大型企业治理与战略落地。”

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/29d04aea17089fdd9eeb2e726ab73a3d-sz_1401312.jpg)

随后，孔明先生做了**YonClaw助力企业治理**的全景能力展示。

**【关于战略落地】**孔明道：“大企业战略难以落地，根本原因是‘规划’与‘执行’之间存在巨大鸿沟。YonClaw的核心能力，是将自然语言任务自动拆解为可执行步骤，调用Skill或工具逐层推进，执行结果回写至ERP系统，并持续跟踪状态，支持中断后恢复。刘公只需说一句‘帮我推进本季度降本增效计划’，剩下的交给YonClaw即可。”

**【关于安全管控】**孔明补充：“企业级智能体，安全是底线。YonClaw采用双重权限模型——最终生效权限 = 提问人权限 ∩ 智能体权限 ∩ 目标系统授权范围，并建立五层鉴权架构：身份认证、命令授权、数据权限、风险执行、审计追踪工作。”

**【关于智能工作台】**孔明让刘总看YonClaw的节点化工作台界面——“订单节点”展示实时订单状态与流转；“审批节点”汇聚待办并支持直接处理；“洞察节点”由AI自动生成经营建议；“预警节点”实时推送风险提醒。“这些节点，人机共用同一语义，随时可被AI驱动，也随时可被人操作。”

**【关于成长与记忆】**孔明总结道，YonClaw不只做事，还懂用户。它维护用户画像、会话上下文和长期记忆，熟悉你的岗位、常用功能和操作习惯。下次你再找它，它已记得你是谁、关心什么、你的权限边界在哪里。

刘总听罢，起身深深一拜：“先生安天下莫过于此！今刘某终于明白，**YonClaw之功，在于让AI真正进入企业经营的核心，而非游离于边缘**。恳请先生出山，携YonClaw辅佐刘某，共图宏业！”

孔明起身扶住刘总，微微一笑：“天时已至，亮愿效犬马之劳，明日随公下山，共谋大业。”

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/ff55e79521b01cc285be2a49d1592dc4-sz_1515649.jpg)

## 尾声：从隆中到天下

此后，孔明携YonClaw全力辅佐刘总——

*· 【战略规划层面】YonClaw将年度战略自动拆解为季度、月度任务，逐层追踪执行进度；*

*· 【运营管控层面】财务月结从五天压缩至一天，供应链预警从滞后变成实时；*

*· 【智能洞察层面】每日晨会前，一份图文并茂的经营日报已静静躺在管理层的智能工作台；*

*· 【安全治理层面】每一次操作、每一个接口调用、每一份回写的数据，均在五层鉴权框架下安全运行。*

半载之后，刘总公司业绩欣欣向荣，内部协同效率大幅提升，数字化转型初见成效。

江湖传言：“三顾茅庐，得一智者；得一YonClaw，定三分天下。”

![Image](https://img.xiumi.us/xmi/ua/1zZWL/i/9b985b5186caee4e085a574c425dfa12-sz_1495260.jpg)`
  },
{
    id: "tea-3",
    module: "技术茶馆",
    category: "研发动态",
    title: "致读者·创刊号卷首语",
    summary: "总体设计部《BIP技术与架构》创刊号发布，介绍架构殿堂、AI天空、技术茶馆三大栏目，及5月刊精选内容",
    content: `我们为何而来

此刻，你手中的这份《BIP技术与架构》读物，正式创刊。

它是BIP总体设计部主编的一份内部技术月刊。我们创办它，只有一个朴素的愿望：让每一位置身 BIP 技术世界的同仁，无论新知故交，都能在这里找到一条清晰的路——通往更扎实的规范、更前沿的视野，以及更真实的技术同行者。

这本刊物读什么

刊物分为三大板块，内外兼顾：

· 架构殿堂（内部知识）

这里沉淀 BIP 内部规范与核心概念。本期收录：数据库对象命名规范（从表、字段、主键到索引的完整命名约定）、BIP 安全编码规范·输入管理（覆盖 XSS、XXE、反序列化等高危漏洞的强制防护要求）、BIP 性能质量标准·基础硬件环境要求（服务器、网络、中间件的性能基线与达标/优秀指标），以及一篇由韩亚平专家点播、专为新人撰写的《业务对象是什么》—— 从元数据到属性、实体、关联、规则链，帮你拎起 BIP 建模体系的第一个核心支点。

· AI 天空（业界知识）

我们从外部精选最具生产力的技术内容。本期带来：Harness Engineering——AI 时代让智能体可控、可验证、可回归的新软件工程方法论；Claude Code 50+ 命令深度解读，助你把 AI 编码工具用深用透；以及 Karpathy 爆火的 LLM Wiki 方案——从被动检索到主动维护，让 AI 知识库从 JIT 走向 AOT 编译模式。

· 技术茶馆（技术文化与分享）

这里记录技术人的故事与思考。本期有数据主架樊进忠的访谈——二十一载深耕，从代码到架构，见证 iuap 数据底座的演进；也有 YonClaw 篇《三顾茅庐》—— 以古喻今，品一品企业级 AI 超级智能体的神韵。

我们的期望

月刊将持续发布。期待与诸位一路同行，也欢迎各位读者踊跃投稿！

总体设计部 · BIP技术与架构月刊 · 2026年5月 · 创刊号`
  }
];

// API Routes
app.get("/api/articles", (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.json(articles);
});

app.post("/api/generate-image-url", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const specialImages: Record<string, string> = {
    "走近数据主架樊进忠": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/6093ae84-6ef4-49cd-8c87-77127be2e94c/6a147fdadb7f3b6fa93048d2.jpg",
    "BIP数据库对象命名规范": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/3c93d163-4af2-44c0-9b94-1df310270810/6a1501fb334b62047b41075f.jpg",
    "数据库对象命名规范": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/3c93d163-4af2-44c0-9b94-1df310270810/6a1501fb334b62047b41075f.jpg",
    "BIP安全编码的输入管理": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/f48bab63-2ce2-488a-9bf3-cd54eccaeca0/6a1502ff2a73ae69c3428e60.jpg",
    "BIP安全编码规范": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/f48bab63-2ce2-488a-9bf3-cd54eccaeca0/6a1502ff2a73ae69c3428e60.jpg",
    "BIP业务对象是什么？": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/96c213ce-4b48-40c9-a7d8-30d194f7e320/6a1508220e5d091d07c01290.jpg",
    "业务对象是什么？": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/96c213ce-4b48-40c9-a7d8-30d194f7e320/6a1508220e5d091d07c01290.jpg",
    "（转载）Harness Engineering，AI时代的新软件工程": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/520991c5-43ab-4bea-a4d8-5f6f1db61202/6a150b0e2a73ae69c342bd19.jpg",
    "Claude Code拥有50多个命令。大多数开发者只用到5个": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/1c39ab6c-5673-42cc-9636-7be60afcffd4/6a150b18334b62047b413a4c.jpg",
    "不用RAG！卡帕西的LLM Wiki方案就很香": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/16050066-9b71-4935-9656-82d77f4143d8/6a150b21db7f3b6fa93106f9.jpg",
    "三顾茅庐—YonClaw篇": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/7aa343a5-736e-4823-973e-0c51f5374ec5/6a14765d9ffd6c4c7ac59301.jpg",
    "致读者·创刊号卷首语": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/5eab00d8-e15c-49b0-86fd-2be7b0173d7e/6a1510d45c33bd08b16f2f6e.jpg",
    "BIP基础硬件环境要求": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/d55a3c83-42d1-4fe1-992d-7eed9c26516e/6a0ff918e0d4df62e745dac7.jpg"
  };

  if (specialImages[title]) {
    return res.json({ imageUrl: specialImages[title] });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Return a professional placeholder if no key
      return res.json({ imageUrl: `https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop` });
    }

    // Use Gemini to generate an image
    // For this magazine, we'll try to generate a high quality visual
    const response = await ai.models.generateContent({
       model: 'gemini-2.0-flash-exp', // Using a reliable model alias
       contents: [{ text: `A high-quality, futuristic tech editorial magazine illustration for an article titled: "${title}". Style: high-tech, digital architecture, glowing circuits, data streams, minimalist, cyberpunk aesthetic, clean 3D render, professional.` }],
       config: {
         imageConfig: { aspectRatio: "16:9" }
       }
    });

    let imageUrl = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
        // Fallback
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/800/450`;
    }

    res.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    res.json({ imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/450` });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
