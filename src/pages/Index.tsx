import { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { documents, activity, Document, Activity } from '@/lib/api';
import { toast } from 'sonner';

const Index = () => {
  const { user, token, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Documents state
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Activity log state
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  
  // Document registration form state
  const [regNumber, setRegNumber] = useState('');
  const [regType, setRegType] = useState('');
  const [regDate, setRegDate] = useState('');
  const [regParty1Name, setRegParty1Name] = useState('');
  const [regParty1Passport, setRegParty1Passport] = useState('');
  const [regParty2Name, setRegParty2Name] = useState('');
  const [regParty2Passport, setRegParty2Passport] = useState('');
  const [regSubject, setRegSubject] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Load activity log when user logs in or cabinet tab is opened
  useEffect(() => {
    if (user && token && activeTab === 'cabinet') {
      loadActivityLog();
    }
  }, [user, token, activeTab]);

  const loadDocuments = async (searchParams?: { search?: string; type?: string; status?: string }) => {
    setIsLoadingDocuments(true);
    try {
      const docs = await documents.getAll(searchParams);
      setAllDocuments(docs);
    } catch (error) {
      toast.error('Ошибка загрузки документов', {
        description: error instanceof Error ? error.message : 'Не удалось загрузить документы'
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadActivityLog = async () => {
    if (!token) return;
    
    setIsLoadingActivity(true);
    try {
      const activities = await activity.getHistory(token);
      setActivityLog(activities);
    } catch (error) {
      toast.error('Ошибка загрузки истории', {
        description: error instanceof Error ? error.message : 'Не удалось загрузить историю действий'
      });
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error('Ошибка входа', {
        description: 'Пожалуйста, заполните все поля'
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Вход выполнен', {
        description: 'Добро пожаловать в систему!'
      });
      setIsLoginDialogOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      toast.error('Ошибка входа', {
        description: error instanceof Error ? error.message : 'Неверный логин или пароль'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Выход выполнен', {
      description: 'До свидания!'
    });
    setActiveTab('home');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await loadDocuments({ search: query });
    } else {
      await loadDocuments();
    }
  };

  const handleRegisterDocument = async () => {
    if (!user || (user.role !== 'notary' && user.role !== 'admin')) {
      toast.error('Ошибка доступа', {
        description: 'У вас нет прав для регистрации документов'
      });
      return;
    }

    if (!token || !regNumber || !regType || !regDate || !regParty1Name || !regParty1Passport || !regSubject) {
      toast.error('Ошибка регистрации', {
        description: 'Пожалуйста, заполните все обязательные поля'
      });
      return;
    }

    setIsRegistering(true);
    try {
      const documentData = {
        number: regNumber,
        type: regType,
        date: regDate,
        party1_name: regParty1Name,
        party1_passport: regParty1Passport,
        party2_name: regParty2Name || undefined,
        party2_passport: regParty2Passport || undefined,
        subject: regSubject,
        notes: regNotes || undefined
      };

      await documents.create(token, documentData);
      
      toast.success('Документ зарегистрирован', {
        description: `Документ ${regNumber} успешно добавлен в реестр`
      });

      // Reset form
      setRegNumber('');
      setRegType('');
      setRegDate('');
      setRegParty1Name('');
      setRegParty1Passport('');
      setRegParty2Name('');
      setRegParty2Passport('');
      setRegSubject('');
      setRegNotes('');

      // Reload documents
      await loadDocuments();
    } catch (error) {
      toast.error('Ошибка регистрации', {
        description: error instanceof Error ? error.message : 'Не удалось зарегистрировать документ'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const filteredDocuments = allDocuments;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      'document_created': 'Создание документа',
      'document_updated': 'Обновление документа',
      'document_viewed': 'Просмотр документа',
      'login': 'Вход в систему',
      'logout': 'Выход из системы'
    };
    return labels[actionType] || actionType;
  };

  const canRegisterDocuments = user && (user.role === 'notary' || user.role === 'admin');

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
                disabled={!canRegisterDocuments}
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
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{user.full_name}</div>
                  <div className="text-xs opacity-75">{user.role === 'notary' ? 'Нотариус' : user.role === 'admin' ? 'Администратор' : 'Пользователь'}</div>
                </div>
                <Button variant="secondary" onClick={handleLogout}>
                  <Icon name="LogOut" size={18} className="mr-2" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
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
                      <Label htmlFor="login">Email</Label>
                      <Input 
                        id="login" 
                        type="email"
                        placeholder="Введите email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoggingIn}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Введите пароль" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoggingIn}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLogin();
                          }
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'Вход...' : 'Войти'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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

              <Card className="hover-scale">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="Shield" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Защита данных</CardTitle>
                  <CardDescription>Все документы защищены современными средствами криптографии</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-scale cursor-pointer" onClick={() => setActiveTab('help')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon name="HelpCircle" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Справка</CardTitle>
                  <CardDescription>Руководство пользователя и ответы на частые вопросы</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="mt-12">
              <CardHeader>
                <CardTitle>Статистика системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{allDocuments.length}</div>
                    <div className="text-muted-foreground mt-2">Документов в реестре</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{allDocuments.filter(d => d.status === 'Зарегистрирован').length}</div>
                    <div className="text-muted-foreground mt-2">Зарегистрировано</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{allDocuments.filter(d => d.status === 'В обработке').length}</div>
                    <div className="text-muted-foreground mt-2">В обработке</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold">Реестр документов</h2>
              <p className="text-muted-foreground mt-2">Полный список всех зарегистрированных документов</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted-foreground">Загрузка документов...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номер</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип документа</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Стороны</TableHead>
                        <TableHead>Предмет</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.number}</TableCell>
                          <TableCell>{formatDate(doc.date)}</TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'Зарегистрирован' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {doc.party1_name}
                            {doc.party2_name && `, ${doc.party2_name}`}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{doc.subject}</TableCell>
                        </TableRow>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Документы не найдены
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold">Поиск документов</h2>
              <p className="text-muted-foreground mt-2">Найдите нужный документ по номеру, типу или сторонам</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Параметры поиска</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Поиск</Label>
                  <Input 
                    id="search" 
                    placeholder="Введите номер документа, тип или имя стороны" 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Результаты поиска</CardTitle>
                <CardDescription>
                  {isLoadingDocuments ? 'Поиск...' : `Найдено документов: ${filteredDocuments.length}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted-foreground">Поиск документов...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номер</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Тип документа</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Стороны</TableHead>
                        <TableHead>Предмет</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.number}</TableCell>
                          <TableCell>{formatDate(doc.date)}</TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'Зарегистрирован' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {doc.party1_name}
                            {doc.party2_name && `, ${doc.party2_name}`}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{doc.subject}</TableCell>
                        </TableRow>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            {searchQuery ? 'По вашему запросу ничего не найдено' : 'Введите параметры поиска'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold">Регистрация документа</h2>
              <p className="text-muted-foreground mt-2">Внесение нового документа в реестр</p>
            </div>

            {!canRegisterDocuments ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Icon name="Lock" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Доступ ограничен</h3>
                    <p className="text-muted-foreground">
                      Регистрация документов доступна только для нотариусов и администраторов.
                      {!user && ' Пожалуйста, войдите в систему.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Данные документа</CardTitle>
                  <CardDescription>Заполните все обязательные поля для регистрации</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-number">Номер документа *</Label>
                      <Input 
                        id="reg-number" 
                        placeholder="Например: 1N-109/2024" 
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        disabled={isRegistering}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-type">Тип документа *</Label>
                      <Select value={regType} onValueChange={setRegType} disabled={isRegistering}>
                        <SelectTrigger id="reg-type">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Договор купли-продажи">Договор купли-продажи</SelectItem>
                          <SelectItem value="Доверенность">Доверенность</SelectItem>
                          <SelectItem value="Завещание">Завещание</SelectItem>
                          <SelectItem value="Согласие">Согласие</SelectItem>
                          <SelectItem value="Свидетельство">Свидетельство</SelectItem>
                          <SelectItem value="Договор дарения">Договор дарения</SelectItem>
                          <SelectItem value="Договор аренды">Договор аренды</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-date">Дата документа *</Label>
                    <Input 
                      id="reg-date" 
                      type="date" 
                      value={regDate}
                      onChange={(e) => setRegDate(e.target.value)}
                      disabled={isRegistering}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Первая сторона *</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="party1-name">ФИО *</Label>
                        <Input 
                          id="party1-name" 
                          placeholder="Иванов Иван Иванович" 
                          value={regParty1Name}
                          onChange={(e) => setRegParty1Name(e.target.value)}
                          disabled={isRegistering}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="party1-passport">Паспорт *</Label>
                        <Input 
                          id="party1-passport" 
                          placeholder="1234 567890" 
                          value={regParty1Passport}
                          onChange={(e) => setRegParty1Passport(e.target.value)}
                          disabled={isRegistering}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Вторая сторона (опционально)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="party2-name">ФИО</Label>
                        <Input 
                          id="party2-name" 
                          placeholder="Петров Петр Петрович" 
                          value={regParty2Name}
                          onChange={(e) => setRegParty2Name(e.target.value)}
                          disabled={isRegistering}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="party2-passport">Паспорт</Label>
                        <Input 
                          id="party2-passport" 
                          placeholder="1234 567890" 
                          value={regParty2Passport}
                          onChange={(e) => setRegParty2Passport(e.target.value)}
                          disabled={isRegistering}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-subject">Предмет документа *</Label>
                    <Textarea 
                      id="reg-subject" 
                      placeholder="Краткое описание предмета документа" 
                      value={regSubject}
                      onChange={(e) => setRegSubject(e.target.value)}
                      disabled={isRegistering}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-notes">Примечания</Label>
                    <Textarea 
                      id="reg-notes" 
                      placeholder="Дополнительные примечания (опционально)" 
                      value={regNotes}
                      onChange={(e) => setRegNotes(e.target.value)}
                      disabled={isRegistering}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleRegisterDocument}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Регистрация...
                      </>
                    ) : (
                      <>
                        <Icon name="FilePlus" size={18} className="mr-2" />
                        Зарегистрировать документ
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'cabinet' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold">Личный кабинет</h2>
              <p className="text-muted-foreground mt-2">Управление профилем и просмотр истории действий</p>
            </div>

            {!user ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Icon name="User" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Требуется авторизация</h3>
                    <p className="text-muted-foreground mb-4">
                      Для доступа к личному кабинету необходимо войти в систему
                    </p>
                    <Button onClick={() => setIsLoginDialogOpen(true)}>
                      <Icon name="LogIn" size={18} className="mr-2" />
                      Войти
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Информация о пользователе</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">ФИО</Label>
                        <p className="font-medium">{user.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Роль</Label>
                        <p className="font-medium">
                          {user.role === 'notary' ? 'Нотариус' : user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </p>
                      </div>
                      {user.phone && (
                        <div>
                          <Label className="text-muted-foreground">Телефон</Label>
                          <p className="font-medium">{user.phone}</p>
                        </div>
                      )}
                      {user.region && (
                        <div>
                          <Label className="text-muted-foreground">Регион</Label>
                          <p className="font-medium">{user.region}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>История действий</CardTitle>
                    <CardDescription>Последние операции в системе</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingActivity ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-4 text-muted-foreground">Загрузка истории...</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата и время</TableHead>
                            <TableHead>Действие</TableHead>
                            <TableHead>Описание</TableHead>
                            <TableHead>Документ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activityLog.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell>{new Date(activity.created_at).toLocaleString('ru-RU')}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{getActionTypeLabel(activity.action_type)}</Badge>
                              </TableCell>
                              <TableCell>{activity.description}</TableCell>
                              <TableCell>{activity.document_number || '-'}</TableCell>
                            </TableRow>
                          ))}
                          {activityLog.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                История действий пуста
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold">Справка и помощь</h2>
              <p className="text-muted-foreground mt-2">Руководство пользователя и ответы на частые вопросы</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Как использовать систему</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Поиск документов</h3>
                  <p className="text-muted-foreground">
                    Используйте раздел "Поиск" для быстрого нахождения документов по номеру, типу или сторонам договора.
                    Введите ключевые слова в поле поиска, и система отобразит все подходящие результаты.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Регистрация документов</h3>
                  <p className="text-muted-foreground">
                    Раздел "Регистрация" доступен только для нотариусов и администраторов. Заполните все обязательные поля формы
                    и нажмите кнопку "Зарегистрировать документ". После успешной регистрации документ появится в общем реестре.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Просмотр реестра</h3>
                  <p className="text-muted-foreground">
                    В разделе "Реестр" отображаются все зарегистрированные документы. Вы можете просматривать информацию
                    о документах, включая номер, дату, тип, статус и стороны договора.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Личный кабинет</h3>
                  <p className="text-muted-foreground">
                    В личном кабинете вы можете просмотреть свою информацию и историю действий в системе.
                    Для доступа к кабинету необходимо войти в систему.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Часто задаваемые вопросы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Как получить доступ к системе?</h3>
                  <p className="text-muted-foreground">
                    Для получения доступа обратитесь к администратору системы. Вам будут предоставлены учетные данные
                    для входа в систему.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Кто может регистрировать документы?</h3>
                  <p className="text-muted-foreground">
                    Регистрировать документы в системе могут только пользователи с ролью "Нотариус" или "Администратор".
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Как найти документ по номеру?</h3>
                  <p className="text-muted-foreground">
                    Перейдите в раздел "Поиск" и введите номер документа в поле поиска. Система автоматически найдет
                    документ с указанным номером.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-muted py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>НОТАРИНКА - Система регистрации нотариальных документов</p>
          <p className="text-sm mt-2">Все права защищены. При использовании материалов ссылка обязательна.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
