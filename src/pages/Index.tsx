import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Document {
  id: string;
  number: string;
  date: string;
  type: string;
  status: string;
  parties: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const mockDocuments: Document[] = [
    { id: '1', number: '1N-109/2012', date: '15.01.2024', type: 'Договор купли-продажи', status: 'Зарегистрирован', parties: 'Иванов И.И., Петров П.П.' },
    { id: '2', number: '2N-202/2019', date: '20.02.2024', type: 'Доверенность', status: 'Зарегистрирован', parties: 'Сидоров С.С.' },
    { id: '3', number: '3N-305/2023', date: '10.03.2024', type: 'Завещание', status: 'В обработке', parties: 'Козлов К.К.' },
  ];

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.parties.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="FileText" size={32} className="text-primary-foreground" />
              <div>
                <h1 className="text-2xl font-bold">НОТАРИНКА</h1>
                <p className="text-sm opacity-90">Система регистрации документов</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button 
                variant={activeTab === 'home' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('home')}
                className="text-primary-foreground hover:bg-secondary/20"
              >
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button 
                variant={activeTab === 'registry' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('registry')}
                className="text-primary-foreground hover:bg-secondary/20"
              >
                <Icon name="FileStack" size={18} className="mr-2" />
                Реестр
              </Button>
              <Button 
                variant={activeTab === 'search' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('search')}
                className="text-primary-foreground hover:bg-secondary/20"
              >
                <Icon name="Search" size={18} className="mr-2" />
                Поиск
              </Button>
              <Button 
                variant={activeTab === 'register' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('register')}
                className="text-primary-foreground hover:bg-secondary/20"
              >
                <Icon name="FilePlus" size={18} className="mr-2" />
                Регистрация
              </Button>
              <Button 
                variant={activeTab === 'cabinet' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('cabinet')}
                className="text-primary-foreground hover:bg-secondary/20"
              >
                <Icon name="User" size={18} className="mr-2" />
                Кабинет
              </Button>
              <Button 
                variant={activeTab === 'help' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('help')}
                className="text-primary-foreground hover:bg-secondary/20"
              >
                <Icon name="HelpCircle" size={18} className="mr-2" />
                Помощь
              </Button>
            </nav>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Вход в систему</DialogTitle>
                  <DialogDescription>Введите ваши учетные данные для доступа к личному кабинету</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="login">Логин</Label>
                    <Input id="login" placeholder="Введите логин" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input id="password" type="password" placeholder="Введите пароль" />
                  </div>
                  <Button className="w-full" onClick={() => setIsLoggedIn(true)}>Войти</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Добро пожаловать в систему нотариального реестра</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Единая информационная система для регистрации, учета и поиска нотариально удостоверенных документов
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="hover-scale cursor-pointer" onClick={() => setActiveTab('registry')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="FileStack" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Реестр документов</CardTitle>
                  <CardDescription>Просмотр всех зарегистрированных документов с возможностью фильтрации</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-scale cursor-pointer" onClick={() => setActiveTab('search')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="Search" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Поиск документов</CardTitle>
                  <CardDescription>Быстрый поиск документов по номеру, дате или другим параметрам</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-scale cursor-pointer" onClick={() => setActiveTab('register')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="FilePlus" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Регистрация документов</CardTitle>
                  <CardDescription>Внесение новых документов в единый реестр системы</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-scale cursor-pointer" onClick={() => setActiveTab('cabinet')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="User" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Личный кабинет</CardTitle>
                  <CardDescription>Управление профилем и просмотр истории операций</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-scale cursor-pointer" onClick={() => setActiveTab('help')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="HelpCircle" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Инструкции и помощь</CardTitle>
                  <CardDescription>Руководства по работе с системой и ответы на вопросы</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-scale">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="Shield" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Безопасность</CardTitle>
                  <CardDescription>Защищенное хранение данных и контроль доступа</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" size={20} />
                  Статистика системы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1,247</div>
                    <div className="text-sm text-muted-foreground mt-1">Всего документов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">23</div>
                    <div className="text-sm text-muted-foreground mt-1">За последний месяц</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">156</div>
                    <div className="text-sm text-muted-foreground mt-1">Активных пользователей</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">99.8%</div>
                    <div className="text-sm text-muted-foreground mt-1">Время доступности</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Реестр документов</h2>
              <p className="text-muted-foreground">Полный перечень зарегистрированных нотариальных документов</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Список документов</CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Тип документа" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="contract">Договор</SelectItem>
                        <SelectItem value="power">Доверенность</SelectItem>
                        <SelectItem value="will">Завещание</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-status">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">Все статусы</SelectItem>
                        <SelectItem value="registered">Зарегистрирован</SelectItem>
                        <SelectItem value="processing">В обработке</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Номер документа</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Тип документа</TableHead>
                      <TableHead>Стороны</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.number}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.parties}</TableCell>
                        <TableCell>
                          <Badge variant={doc.status === 'Зарегистрирован' ? 'default' : 'secondary'}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Поиск документов</h2>
              <p className="text-muted-foreground">Найдите нужный документ по различным параметрам</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Параметры поиска</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-number">Номер документа</Label>
                    <Input 
                      id="search-number" 
                      placeholder="Например: 1N-109/2012"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-date">Дата регистрации</Label>
                    <Input id="search-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-type">Тип документа</Label>
                    <Select>
                      <SelectTrigger id="search-type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Договор купли-продажи</SelectItem>
                        <SelectItem value="power">Доверенность</SelectItem>
                        <SelectItem value="will">Завещание</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-parties">ФИО сторон</Label>
                    <Input id="search-parties" placeholder="Введите ФИО" />
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  <Icon name="Search" size={18} className="mr-2" />
                  Найти документ
                </Button>
              </CardContent>
            </Card>

            {searchQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>Результаты поиска ({filteredDocuments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номер документа</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Стороны</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.number}</TableCell>
                          <TableCell>{doc.date}</TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>{doc.parties}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'Зарегистрирован' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Icon name="Eye" size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'register' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Регистрация документов</h2>
              <p className="text-muted-foreground">Внесение нового документа в единый реестр</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Форма регистрации</CardTitle>
                <CardDescription>Заполните все обязательные поля для регистрации документа</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">Тип документа *</Label>
                    <Select>
                      <SelectTrigger id="doc-type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Договор купли-продажи</SelectItem>
                        <SelectItem value="power">Доверенность</SelectItem>
                        <SelectItem value="will">Завещание</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-date">Дата оформления *</Label>
                    <Input id="doc-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="party1">Сторона 1 (ФИО) *</Label>
                    <Input id="party1" placeholder="Введите ФИО" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="party1-passport">Паспортные данные стороны 1 *</Label>
                    <Input id="party1-passport" placeholder="Серия и номер" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="party2">Сторона 2 (ФИО)</Label>
                    <Input id="party2" placeholder="Введите ФИО" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="party2-passport">Паспортные данные стороны 2</Label>
                    <Input id="party2-passport" placeholder="Серия и номер" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-subject">Предмет документа *</Label>
                  <Textarea id="doc-subject" placeholder="Краткое описание предмета документа" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-notes">Дополнительные сведения</Label>
                  <Textarea id="doc-notes" placeholder="Дополнительная информация" rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button className="w-full md:w-auto">
                    <Icon name="Save" size={18} className="mr-2" />
                    Зарегистрировать документ
                  </Button>
                  <Button variant="outline" className="w-full md:w-auto">
                    Очистить форму
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'cabinet' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Личный кабинет</h2>
              <p className="text-muted-foreground">Управление профилем и просмотр истории</p>
            </div>

            {!isLoggedIn ? (
              <Card>
                <CardHeader>
                  <CardTitle>Требуется авторизация</CardTitle>
                  <CardDescription>Войдите в систему для доступа к личному кабинету</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="LogIn" size={18} className="mr-2" />
                        Войти в систему
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Вход в систему</DialogTitle>
                        <DialogDescription>Введите ваши учетные данные</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-cab">Логин</Label>
                          <Input id="login-cab" placeholder="Введите логин" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-cab">Пароль</Label>
                          <Input id="password-cab" type="password" placeholder="Введите пароль" />
                        </div>
                        <Button className="w-full" onClick={() => setIsLoggedIn(true)}>Войти</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Профиль</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={32} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Иванов Иван Иванович</div>
                        <div className="text-sm text-muted-foreground">Нотариус</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>ivanov@example.ru</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Телефон:</span>
                        <span>+7 (999) 123-45-67</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Регион:</span>
                        <span>Москва</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Icon name="Settings" size={16} className="mr-2" />
                      Настройки
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>История операций</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="FilePlus" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Регистрация документа</div>
                          <div className="text-sm text-muted-foreground">Договор купли-продажи №1N-109/2012</div>
                          <div className="text-xs text-muted-foreground mt-1">15.01.2024, 14:30</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="Search" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Поиск документа</div>
                          <div className="text-sm text-muted-foreground">Поиск по номеру 2N-202/2019</div>
                          <div className="text-xs text-muted-foreground mt-1">14.01.2024, 11:20</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="Eye" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Просмотр реестра</div>
                          <div className="text-sm text-muted-foreground">Просмотр списка документов</div>
                          <div className="text-xs text-muted-foreground mt-1">13.01.2024, 09:45</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Инструкции и помощь</h2>
              <p className="text-muted-foreground">Руководства по работе с системой</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="Book" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Руководство пользователя</CardTitle>
                  <CardDescription>Подробная инструкция по работе с системой регистрации документов</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать PDF
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="Video" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Видеоинструкции</CardTitle>
                  <CardDescription>Обучающие видеоролики по основным функциям системы</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Icon name="Play" size={16} className="mr-2" />
                    Смотреть
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="MessageCircle" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Частые вопросы</CardTitle>
                  <CardDescription>Ответы на наиболее распространенные вопросы пользователей</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть FAQ
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="Phone" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Техподдержка</CardTitle>
                  <CardDescription>Свяжитесь с нами для получения помощи</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>📞 +7 (495) 123-45-67</div>
                    <div>📧 support@notarinka.ru</div>
                    <div>⏰ Пн-Пт: 9:00 - 18:00</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Основные разделы помощи</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-muted/50 rounded-lg hover:bg-muted">
                    <span className="font-medium">Как зарегистрировать новый документ?</span>
                    <Icon name="ChevronDown" size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 text-sm text-muted-foreground">
                    Для регистрации документа перейдите в раздел "Регистрация документов", заполните все обязательные поля формы и нажмите кнопку "Зарегистрировать документ". Система автоматически присвоит документу уникальный номер.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-muted/50 rounded-lg hover:bg-muted">
                    <span className="font-medium">Как найти документ в реестре?</span>
                    <Icon name="ChevronDown" size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 text-sm text-muted-foreground">
                    Используйте раздел "Поиск документов" для быстрого поиска по номеру, дате, типу документа или ФИО сторон. Также доступен просмотр полного реестра в соответствующем разделе.
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-muted/50 rounded-lg hover:bg-muted">
                    <span className="font-medium">Как получить доступ к личному кабинету?</span>
                    <Icon name="ChevronDown" size={20} className="group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-4 text-sm text-muted-foreground">
                    Для доступа к личному кабинету необходимо войти в систему используя ваш логин и пароль. Если у вас нет учетных данных, обратитесь к администратору системы.
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-secondary text-secondary-foreground mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">О системе</h3>
              <p className="text-sm opacity-90">Единая информационная система нотариального реестра для регистрации и учета документов</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Разделы</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li className="cursor-pointer hover:opacity-100" onClick={() => setActiveTab('registry')}>Реестр документов</li>
                <li className="cursor-pointer hover:opacity-100" onClick={() => setActiveTab('search')}>Поиск</li>
                <li className="cursor-pointer hover:opacity-100" onClick={() => setActiveTab('register')}>Регистрация</li>
                <li className="cursor-pointer hover:opacity-100" onClick={() => setActiveTab('help')}>Помощь</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Контакты</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>+7 (495) 123-45-67</li>
                <li>info@notarinka.ru</li>
                <li>Москва, ул. Примерная, д. 1</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Документы</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li className="cursor-pointer hover:opacity-100">Политика конфиденциальности</li>
                <li className="cursor-pointer hover:opacity-100">Пользовательское соглашение</li>
                <li className="cursor-pointer hover:opacity-100">Техподдержка</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-foreground/20 mt-8 pt-6 text-center text-sm opacity-75">
            © 2024 НОТАРИНКА. Система регистрации документов. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
